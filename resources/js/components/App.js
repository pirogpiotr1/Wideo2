import React from 'react';
import ReactDOM from 'react-dom';
import MediaHandler from '../MediaHandler'
import Pusher from 'pusher-js'
import Peer from 'simple-peer'
import bootbox from 'bootbox';


const  API_KEY = '0f023d4e29ea60055ea7';
const PRESENSE_CHANNEL = 'presence-channel';
class App extends React.Component{
    constructor(){
        super();
        this.displayUser =  [];
        this.state = {
            hasMedia: false,
            otherUserId:null,
            showUsers:this.displayUser,
            activeUsers:null,
            hideVideo:null,
            showMessanger:null,
            messageVal:'',
            appendDOM:''
        };

        this.user = window.user;
        this.user.stream = null;
        this.peers = {};
        this.members = null;
        this.connectedTo = null;


        this.mediaHandler = new MediaHandler();
        this.initPusher();
        this.callTo = this.callTo.bind(this);
        this.initPusher = this.initPusher.bind(this);
        this.setPeer = this.setPeer.bind(this);
        this.removeMember = this.removeMember.bind(this);
         this.appendUsers = this.appendUsers.bind(this);
        this.sendMessageHandler = this.sendMessageHandler.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
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
    initPusher(channelName = PRESENSE_CHANNEL){

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

        if( channelName !== PRESENSE_CHANNEL){
            this.channel.unsubscribe(PRESENSE_CHANNEL);
        }

        this.channel = this.pusher.subscribe( channelName );

        this.channel.bind('pusher:subscription_succeeded', (members)=> {
            this.members = members;
            this.appendUsers();
        });

        this.channel.bind('pusher:member_removed', ({id}) => {

            console.log( `this.connectedTo = ${this.connectedTo}`);
            console.log(id);
            if( this.peers[id] ){
                this.removeMember(id);
                let peer = this.peers[id];
                if( peer !== undefined){
                    peer.destroy();
                }

                this.peers[id] = undefined;
                this.connectedTo = null;
                this.appendUsers();
                this.setState( {hideVideo:true });
                this.setState({activeUsers:false});
                this.setState( {showMessanger:false });
            }else if( this.connectedTo === id ){
                this.connectedTo = null;
                this.appendUsers();
                this.setState( {hideVideo:true });
                this.setState({activeUsers:false});
                this.setState( {showMessanger:false });
            }
            console.log('removed');

        });
        this.channel.bind('pusher:member_added', (member) =>{

            this.appendUsers();
        });

        this.channel.bind(`client-signal-${this.user.id}`,(signal)=>{

            let peer = this.peers[signal.userId];
            // jesli puste to znaczy ze ktos dzwoni do nas

            if(peer === undefined) {
                bootbox.confirm(`${this.members.members[signal.userId]['name']} want to connect, do you accept?`, (result) => {
                    if (result) {

                        this.setState({otherUserId: signal.userId});
                        peer = this.setPeer(signal.userId, false);
                        peer.signal(signal.data);
                        this.connectedTo = signal.userId ;

                    } else {
                        this.channel.trigger(`client-reject-${signal.userId}`, {
                            type: 'signal',
                            userId: this.user.id
                        });
                    }
                });
            }

            if(peer)
            peer.signal(signal.data);

          // this.appendUsers('empty');
        });

        this.channel.bind(`client-reject-${this.user.id}`,(signal) =>{
            alert(`${this.members.members[signal.userId]['name']} rejected your offer!`);
        });

    }
    setPeer(userId,initiator = true,){

        const peer = new Peer({
            initiator,
            stream:this.user.stream,
            trickle:false
        });

        peer.on('signal',(data)=>{
            this.channel.trigger(`client-signal-${userId}`,{
                type:'signal',
                userId:this.user.id,
                data:data
            });
        });

        peer.on('stream',(stream) =>{
            this.userVideo.stream = stream;
            // this.myVideo.src = URL.createObjectURL(stream);
            this.userVideo.srcObject = stream;
            this.userVideo.play();
        });

        peer.on('connect',(data) =>{
            console.log(`${userId} connected`);
            this.connectedTo = userId;
            this.setState( { activeUsers: true } );
            this.setState( { hideVideo:false } );
            this.setState( { showMessanger:true } );
        });

        peer.on('close',()=>{
            let peer = this.peers[userId];
            if(peer !== undefined){
                peer.destroy();
            }

            this.peers[userId] = undefined;

            console.log('closed');
        });
        peer.on('error', (err) => {console.log(err)});

        peer.on('data', (data) => {
            this.appendMessage(data);
        });

        return peer;
    }
    callTo(userId){
        let id = null;
        if(typeof(userId) === 'object' ){
            id = userId['row'];
        }else{
            id = userId;
        }

        this.peers[id] = this.setPeer(id);
    }
    removeMember(id){
        this.members.count --;
        delete this.members.members[id];
    }

    appendUsers($isEmpty = null){

        this.displayUser = [];

        if(!$isEmpty) {
            Object.keys(this.members.members).forEach((key, item) => {
                if (this.user.id !== key) {
                    this.displayUser.push(key);
                }
            });
        }else{
            this.displayUser = [];
        }

        this.setState({
            showUsers: this.displayUser,
        });

        if(!this.displayUser)
        return null;
    }
    hideButtons(value){
        return 'btn-con '+(( value === this.state.activeUsers ) ?'hide':'default');
    }
    hideVideoOnClosed(value){
        return 'user-video '+(( value === this.state.hideVideo ) ?'hide':'default');
    }
    showMessangerCon(value){
        return 'messanger-con '+(( value === this.state.showMessanger ) ?'default':'hide');
    }

    sendMessageHandler(event){
        let peer = this.peers[this.connectedTo];
        peer.send(this.state.messageVal);
        event.preventDefault();
    }
    handleInputChange(event){
        this.setState({messageVal: event.target.value});
    }
    appendMessage(message){
        alert(message);

        this.setState({appendDOM:message});

    }
    render() {

        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-header">Wideo cont</div>
                                <div className={this.hideButtons(true)}>
                                {
                                    this.displayUser.map((row,id)=>{
                                       return  <button onClick={() =>{this.callTo({row} )}} key={row}> {this.members.members[row]['name']}  {row}  </button>
                                   })
                                }
                            </div>
                            <div className="card-body">
                                <div className="video-inner">
                                    <div className="video-wrapper">
                                        <video className="my-video" ref={(ref) => {
                                            this.myVideo = ref;
                                        }}></video>
                                        <video className={this.hideVideoOnClosed(true)} ref={(ref) => {
                                            this.userVideo = ref;
                                        }}></video>
                                    </div>
                                </div>
                                <div className={this.showMessangerCon(true)}>
                                    {
                                        this.state.appendDOM ?
                                            <div>{ this.state.appendDOM}</div>
                                            :
                                            ''
                                    }
                                    <form >
                                        <label>
                                            Type message:
                                            <input type="text" value={this.state.messageVal} onChange={this.handleInputChange} />
                                        </label>
                                        <input type="button" onClick={this.sendMessageHandler} value="Send" />
                                    </form>
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
