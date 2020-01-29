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
        this.messages = [];
        this.state = {
            hasMedia: false,
            otherUserId:null,
            showUsers:this.displayUser,
            activeUsers:null,
            hideVideo:null,
            hideSub: null,
            showMessanger:null,
            messageVal:'',
            appendDOM:[]

        };
        this.mesRef = React.createRef();

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
        this.leaveRoom = this.leaveRoom.bind(this);

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
        this.scrollToBottom();
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

        this.channel.bind('pusher:member_removed', ({id,info}) => {

            if( this.peers[id] ){

                if(id !== this.user.id )
                    alert(`${info.name} disconnected!`);

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
                this.messages = [];
                this.state.appendDOM = [];

            }else if( this.connectedTo === id ){

                if(id !== this.user.id )
                    alert(`${info.name} disconnected!`);

                this.connectedTo = null;

                this.appendUsers();
                this.setState( {hideVideo:true });
                this.setState({activeUsers:false});
                this.setState( {showMessanger:false });
                this.messages = [];
                this.state.appendDOM = [];
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
                        this.peers[signal.userId] = peer;
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

        this.channel.bind(`client-left-${this.user.id}`,(signal) =>{
            if(signal.userId !== this.user.id )
              alert(`${this.members.members[signal.userId]['name']} left room!`);
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
            this.setState( { hideSub:true } );

        });

        peer.on('close',()=>{
            console.log(userId);
            let peer = this.peers[userId];

            if(peer !== undefined){
                peer.destroy();
            }

            this.peers[userId] = undefined;
            this.connectedTo = null;
            this.appendUsers();
            this.setState({hideVideo: true});
            this.setState({activeUsers: false});
            this.setState({showMessanger: false});
            this.setState( { hideSub:false } );

            this.messages = [];
            this.state.appendDOM = [];

        });

        peer.on('error', (err) => {console.log(err)});

        peer.on('data', (data) => {
            this.appendMessage({
                'content':''+data,
                'owner':'other',
                'name':this.members.members[this.connectedTo]['name']
            });
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
        var sortable = [];
        var displayUser = [];
        for (var member in this.members.members) {

            if(this.user.id != member)
              sortable.push([member, this.getDistanceFromLatLonInKm(this.user.lat,this.user.lon,this.members.members[member]['lat'],this.members.members[member]['lon'])]);
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });

       // console.log(sortable);

        if(!$isEmpty) {
            for( let el of sortable){

                displayUser.push(el[0]);
                if( displayUser.length == 10){
                    break;
                }
            }

          //  Object.keys(this.members.members).forEach((key, item) => {
           //     if (this.user.id !== key) {
           //         this.displayUser.push(key);
          //
          //  });
        }else{
            this.displayUser = [];
        }
        this.displayUser  = displayUser;
        console.log( this.displayUser);
        this.setState({
            showUsers: this.displayUser,
        });

        if(!this.displayUser)
        return null;
    }
    hideButtons(value){
        return 'btn-con '+(( value === this.state.activeUsers ) ?'hide':'default');
    }
    hideSub(value){
        return 'video-wrapper '+(( value === this.state.hideSub ) ?' hide-before':'');
    }
    hideVideoOnClosed(value){
        return 'user-video '+(( value === this.state.hideVideo ) ?'':'default');
    }
    showMessangerCon(value){
        return 'messanger-con '+(( value === this.state.showMessanger ) ?'default':'hide');
    }

    sendMessageHandler(event){
        if(this.state.messageVal) {
            let peer = this.peers[this.connectedTo];
            peer.send(this.state.messageVal);
            this.appendMessage({
                'content': this.state.messageVal,
                'owner': 'my',
                'name': this.user.name
            });
            this.setState({messageVal: ''});


        }
    }
    leaveRoom(id =  this.connectedTo ){

        if( this.peers[id] ) {

            this.channel.trigger(`client-left-${id}`, {
                type: 'signal',
                userId: this.user.id
            });

            let peer = this.peers[id];
            if (peer !== undefined) {
                peer.destroy();
            }

            this.peers[id] = undefined;
            this.connectedTo = null;

            this.setState({hideVideo: true});
            this.setState({hideSub: false});
            this.setState({activeUsers: false});
            this.setState({showMessanger: false});
            this.appendUsers();
            this.messages = [];
            this.state.appendDOM = [];
        }
    }
    handleInputChange(event){
       this.setState({messageVal: event.target.value});
    }
    appendMessage(message){
        this.messages.push(message);

        this.setState({appendDOM: this.messages },
            () => {
                this.scrollToBottom();
            }
            );

    }
    messageClass(el){
        return 'message '+ (el);
    }
    scrollToBottom() {
        this.mesRef.current.scrollTop = this.mesRef.current.scrollHeight;
    }
     getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d;
    }
    deg2rad(degree) {
        return degree * (Math.PI/180)
    }

    render() {
        return (
            <div className="container">
                <div className="main-wideo-con--inner">
                    <div className="main-wideo-con--wrapper">
                            <div className="card-header width100 color-white bg-own">Video chat</div>
                            <div className="main-body">
                                <div className="video-inner">
                                    <div className={this.hideSub(true)}>
                                        <video className="my-video" ref={(ref) => {
                                            this.myVideo = ref;
                                        }}></video>
                                        <video className={this.hideVideoOnClosed(true)} ref={(ref) => {
                                            this.userVideo = ref;
                                        }}></video>
                                    </div>
                                </div>
                                <div className={this.hideButtons(true)}>
                                    <div className="btn-con-header">Active users</div>
                                    {
                                        this.displayUser.map((row,id)=>{
                                            return  <button onClick={() =>{this.callTo({row} )}} key={row}> {this.members.members[row]['name']}  {row}  </button>
                                        })
                                    }
                                </div>
                                <div className={this.showMessangerCon(true)}>
                                    <div className="btn-con-header">
                                      <input type="button" onClick={() => this.leaveRoom()} value = "Leave room" />
                                    </div>
                                    <div className="btn-con-header">Messages</div>
                                        <div className="messages-true-con" ref={this.mesRef}>
                                        {
                                            this.state.appendDOM?

                                                this.state.appendDOM.map((d, id)=>{
                                                    return (
                                                        <div className={this.messageClass(d.owner)} key={id}>
                                                            <div className="name" >{d.name}</div>
                                                            <div className={d.owner} >{d.content}</div>
                                                        </div>
                                                    )
                                                })
                                            :''
                                    }

                                        </div>
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
        );
    }
}

export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
window.addEventListener('keydown',function(e){if(e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13){if(e.target.nodeName=='INPUT'&&e.target.type=='text'){e.preventDefault();return false;}}},true);
