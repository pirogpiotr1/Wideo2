import React from 'react';
import ReactDOM from 'react-dom';
import MediaHandler from '../MediaHandler'
import Pusher from 'pusher-js'
import Peer from 'simple-peer'

const  API_KEY = '0f023d4e29ea60055ea7';

class App extends React.Component{
    constructor(){
        super();
        this.displayUser =  [];
        this.state = {
            hasMedia: false,
            otherUserId:null,
            showUsers:this.displayUser
        };

        this.user = window.user;
        this.user.stream = null;
        this.peers = {};
        this.members = null;



        this.mediaHandler = new MediaHandler();
        this.initPusher();
        this.callTo = this.callTo.bind(this);
        this.initPusher = this.initPusher.bind(this);
        this.setPeer = this.setPeer.bind(this);
        this.removeMember = this.removeMember.bind(this);
        this.appendUsers = this.appendUsers.bind(this);
    }
    componentDidMount(){

        this.mediaHandler.getPermissions()
            .then((stream)=>{
                this.setState({hasMedia:true});
                this.user.stream = stream;
               // this.myVideo.src = URL.createObjectURL(stream);
                this.myVideo.srcObject = stream;
                this.myVideo.play();
            });
    }
    initPusher(){

        this.pusher = new Pusher(API_KEY,{
            authEndpoint:'/pusher/auth',
            cluster: 'eu',
            forceTLS: true,
            auth:{
                params:this.user.id,
                headers:{
                    'X-CSRF-Token': window.csrfToken
                }

            }
        });
        this.channel = this.pusher.subscribe('presence-channel');
        this.channel.bind('pusher:subscription_succeeded', (members)=> {
           // let me = presenceChannel.members.me;
            this.members = members;
            this.appendUsers();
        });

        this.channel.bind('pusher:member_removed', ({id}) => {
            // for example:
            this.removeMember();
        });
        this.channel.bind('pusher:member_added', function(member) {
          //  channel_members.push({id, info});
        });

        this.channel.bind(`client-signal-${this.user.id}`,(signal)=>{
            let peer = this.peers[signal.userId];

            console.log(signal.userId);
            // jesli puste to znaczy ze ktos dzwoni do nas
            if(peer === undefined){
                this.setState({otherUserId:signal.userId});
                peer = this.setPeer(signal.userId,false);
            }
            peer.signal(signal.data);
        });

    }
    setPeer(userId,initiator = true){

        const peer = new Peer({
            initiator,
            stream:this.user.stream,
            trickle:false
        });

        peer.on('signal',(data)=>{
            console.log(`client-signal-${userId}`);
            this.channel.trigger(`client-signal-${userId}`,{
                type:'signal',
                userId:this.user.id,
                data:data
            })
        });

        peer.on('stream',(stream) =>{
            this.userVideo.stream = stream;
            // this.myVideo.src = URL.createObjectURL(stream);
            this.userVideo.srcObject = stream;
            this.userVideo.play();
        });
        peer.on('close',()=>{
            let peer = this.peers[userId];
            if(peer !== undefined){
                peer.destroy();
            }
            this.peers[userId] = undefined;
        });

        return peer;
    }
    callTo(userId){
        this.peers[userId['row']] = this.setPeer(userId['row']);
    }
    removeMember(){
        this.members.count --;
    }
    appendUsers(){

        Object.keys(this.members.members).forEach((key,item) =>{
            if(this.user.id !== key){
                this.displayUser.push(key) ;
            }
        });

        this.setState({
            showUsers: this.displayUser,
        })
    }
    render() {

        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">Wideo cont</div>
                            {this.displayUser.map((row,id)=>{
                                return  <button onClick={() =>{this.callTo({row} )}} key={row}> {this.members.members[row]['name']}  {row}  </button>
                            })}

                            <div className="card-body">
                                <div className="video-inner">
                                    <div className="video-wrapper">
                                        <video className="my-video" ref={(ref) => {
                                            this.myVideo = ref;
                                        }}></video>
                                        <video className="user-video" ref={(ref) => {
                                            this.userVideo = ref;
                                        }}></video>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
