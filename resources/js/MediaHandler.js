export  default class MediaHandler{
    getPermissions(){
        return new Promise((resolve , reject)=>{
            navigator.mediaDevices.getUserMedia({video:true,audio:true})
                .then((stream)=>{
                    resolve(stream);
                })
                .catch(err => {
                    throw new Error(`no stream found ${err}`);
                })
        });
    }

}
