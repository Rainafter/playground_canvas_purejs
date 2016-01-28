window.onload = function() {

		
    //  canvas setting
    var canvas_w = 300;
    var canvas_h = 300;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    canvas.id     = "myCanvas";
	canvas.width  = canvas_w;
	canvas.height = canvas_h;
	document.body.appendChild(canvas);

     //Global Image settings
    var w = 100;  //box w
    var h = 100;  //box h
    
    var imgsInfo = [
        { src : 'http://riley.dev.kargo.com/code-test/test0.png', x : 110, y : 110, w : w, h : h },
        { src : 'http://riley.dev.kargo.com/code-test/test1.png', x :  150, y : 150 , w : w , h : h },
        { src : 'http://riley.dev.kargo.com/code-test/test2.png', x : 190, y : 190 , w : w,h : h }
    ];



   

    /* Load Manager */
    var LoadManager = {};



    // load image after the previous image get loaded, asychous loading needed for canvas.
    LoadManager.load = function(infos,callback){

        var images = [{src: ''}];
        var loadedImages = 0;
        var numImages = 0;

        for (var i = 0; i < infos.length; i++) {
            numImages++;
        };

        for(var i = 0; i < infos.length; i++) {
            images[i] = {};
            images[i].x = infos[i].x;
            images[i].y = infos[i].y;
            images[i].w = infos[i].w;
            images[i].h = infos[i].h;
            images[i].img = new Image();
            images[i].img.src = infos[i].src;
            images[i].img.onload = function() {
               
                if(++loadedImages >= numImages) {
                    callback(images,images.x,images.y,w,h);
                }
            };
        }
    }




    /* Box View Manager */

    var ViewManager = {};
    ViewManager.pool = [];
    ViewManager.createBoxes = function(imgObj){
      
        for (var i = 0; i < imgsInfo.length; i++) {
            var box = new Box(imgObj[i].img,imgObj[i].x,imgObj[i].y,imgObj[i].w,imgObj[i].h);
            ViewManager.pool.push(box);
            
        };    
       
    }

    ViewManager.addBox = function(obj){

        if(typeof obj === 'object' || obj.img != undefined )
        ViewManager.pool.push(obj);
    }

    ViewManager.animateTo = function(obj,posX,posY,w,h,callback){

        var origX = obj.x;
        var origY = obj.y;
        var origW = obj.w;
        var origH = obj.h;
        
        myAnimationReq = requestAnimationFrame(function(){
           
            ViewManager.animateTo(obj,posX,posY,w,h,callback);
           
            // clear the canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            w = (w == undefined)? origW  : w;
            h = (h == undefined)? origH : h;
            obj.moveTo(posX,posY);
            obj.scaleTo(w,h);

            if(Math.abs(obj.x - posX) < 0.1 && Math.abs(obj.y - posY) < 0.1 && Math.abs(w-origW)<0.1 && Math.abs(h-origH)<0.1){
                // arrived destination
                window.cancelAnimationFrame(myAnimationReq);
                if(typeof callback == "function")callback();
            }
            

            
           
            //render it
            ViewManager.renderAll();
        });

        
        return myAnimationReq;
       
    }



    ViewManager.renderAll = function(){

        for (var i = 0; i < ViewManager.pool.length; i++) {
            ViewManager.pool[i].render();
        };

    }



    /* Box Class */

    function Box(img,x,y,w,h){

        /* private variable */
        var coeff = 15; // Friction for movement

        /* public variable */
        this.img = img;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        /* private method */

        var render = function(img,x,y,w,h){

            var offset_x = -w/2;
            var offset_y = -h/2;
            ctx.save();
            ctx.translate(offset_x,offset_y);
            ctx.drawImage(img,x,y,w,h);
            ctx.restore(); 
        }

        /* public method */

        this.moveTo = function(desX,desY){

            var curY = this.y;
            var curX = this.x
            this.x += (desX - curX) / coeff;
            this.y += (desY - curY) / coeff;
    
        }

        this.scaleTo = function(desW,desH){

            var curW = this.w;
            var curH = this.h;
            this.w += (desW - curW) / coeff;
            this.h += (desH - curH) / coeff;

        }

        this.clear = function(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        this.destroy = function(){
            delete this;
        }

        this.render = function(){
            render(this.img,this.x,this.y,this.w,this.h);
        }

    }



    var init = function(){

        var onLoaded = function(e){
        
            ViewManager.createBoxes(e);
            ViewManager.renderAll();

            var box1 = ViewManager.pool[0];
            var box2 = ViewManager.pool[1];
            var box3 = ViewManager.pool[2];
            ViewManager.animateTo(box1,50,50);
            ViewManager.animateTo(box3,250,250,100,100,function(){
                //callback onComplete
                ViewManager.animateTo(box1,250,50);
                ViewManager.animateTo(box3,50,250,100,100,function(){
                    var middleBox = ViewManager.pool.splice(1,1)[0];
                    console.log(ViewManager.pool,middleBox,middleBox.img,middleBox.x);
                    ViewManager.pool.push(middleBox);
                    ViewManager.animateTo(middleBox,150,150,310,310);
                });
               
            });
                   
        }

        LoadManager.load(imgsInfo, onLoaded);
    }

    init();

    
   
   

        

};
