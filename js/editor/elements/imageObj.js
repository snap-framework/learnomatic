define([
	
    'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function(options) {
			this.options=options;
			this.courseFolder="courses/"+this.editor.courseFolder;
			this.folder="content/medias/images/";

		},
	   changePermissions:function(){
		   this.permissions.editButtons.add=false;
		   //this.permissions.editButtons.config=true;
		   

	   },

	   connectDom:function(){
		   var that=this;
		   this.$el=$("#"+this.id);
		   this.$holder=this.getHolder();
		   
			this.$el.children("img").click(function(){
				that.configClicked();
			});
	   },		
/*---------------------------------------------------------------------------------------------
-------------------------CONFIGURATION
---------------------------------------------------------------------------------------------*/			
	   changeDefaultLbxSettings:function(params){
		   params.title="Image Configuration";
		 return params;
	   },
		changeDefaultConfigSettings:function(params){

			params.$paramTarget=this.$el.find("img");
			
			params.attributes= {
				   "alt":""
				   
					};
			return params;
			
		},
		loadConfigCustom:function(params){
			
		   $("#"+params.lbx.targetId).append("<div id='LOM-img-gallery'></div>");
			var that=this;
			$.post('../../editor.php', { action:"readfolder", filename: this.courseFolder+"/"+this.folder, regex:"/^.*\.(jpg|jpeg|png|gif|svg)$/i" }, function(data){
				//parse the jSON
				//console.log(data);
				that.loadGallery(data, params);
				

			}).fail(function() {
				alert( "Posting failed." );
			});				
		},

/*---------------------------------------------------------------------------------------------
-------------------------IMAGE  GALLRY
---------------------------------------------------------------------------------------------*/			
		loadGallery:function(images, params){
			var aImages=images.split(",");
			
			//remove folders
			aImages=this.cleanGallery(aImages);
			this.generateGallery(aImages, params);
			

		},
		cleanGallery:function(aImages){
			var newArray=[];
			for(var i=0;i<aImages.length;i++){

				if (aImages[i].indexOf(".")>=0){
					newArray[newArray.length]=aImages[i];
				}
				
			}
			
			
			return newArray;
		},	
		generateGallery:function(aImages, params){
			var that=this;
			var modulo=(aImages.length%6===0)?6:4;
			var lineCounter=1;
			var $gallery=$("#LOM-img-gallery");
			var $row;
			var $img;
			var bootstrap=(modulo===6)?"col-md-2":"col-md-3";
			var obj=params.lbx.obj;
			var src=obj.$el.find("img").attr("src");
			
			$gallery.append("<input type='hidden' id='LOM-src' class='LOM-attr-value' name='src' value='"+src+"'>");

			

			for(var i=0;i<aImages.length;i++){
				if(lineCounter===1){
					$gallery.append("<div class='row'></div>");
					$row=$gallery.children(".row").last();
				}

				
				$row.append("<div class='LOM-img-btn "+bootstrap+"'><button><img src='"+this.folder+aImages[i]+"' class='img-responsive'></button></div>");
				$img=$row.children(".LOM-img-btn").last();
				
				//check if this is selected
				if($img.children("button").children("img").attr("src")===src){
					$img.addClass("LOM-gallery-selected");
				}else{
					$img.removeClass("LOM-gallery-selected");
				}
				
				if(lineCounter%modulo===0 && lineCounter!== 0){
					lineCounter=1;
				}else{
					//CHECK ALSO IF LAST
				   lineCounter++;
				   
				}

				
			}
			$gallery.append("<div class='row'><div class='col-md-3' id='LOM-img-upload'></div></div>");
			
			var $upload=$("#LOM-img-upload");
			this.createUpload($upload);

			
			$(".LOM-img-btn").click(function(){
				var newSrc=$(this).find("img").attr("src");
				$("#LOM-src").attr("value", newSrc);
				$(".LOM-gallery-selected").removeClass("LOM-gallery-selected");
				$(this).addClass("LOM-gallery-selected");
				
			});
			$(".LOM-img-btn").dblclick(function(){
				var newSrc=$(this).find("img").attr("src");
				that.changeImage(newSrc)
			});
			
		},
		
		changeImage:function(filename){
				this.$el.children("img").attr("src", filename);
				   this.storeValue();
				   this.editor.savePage();
				   this.closeLbx();
			
		},
		
		createUpload:function($container){
			var that=this;
			$container.append("<h3>Upload Image</h3>")
			$container.append("<label>Select image(max 500kb file size) <input type='file' name='file' id='file' /></label><span id='uploaded_image'></span>");
			$container.append("<button class='snap-sm ico-LOM-upload'>Upload</button");
			//$container.append(" <input type='hidden' id='info' name='info' value='upload_image'>");
			$container.children("button").hide();
			
			var $file=$("#file");
			$file.on("change", function(){
				var fichier=this.files[0];
				var filename=fichier.name;
				var filext=filename.split('.').pop().toLowerCase();
				if(jQuery.inArray(filext, ['gif', 'png', 'jpg', 'jpeg']) ===-1){
					alert("wrong fily type");
					return false;
				}else{
					if(fichier.size >500000){
						alert("File too big");
						return false;
					}else{
						var form_data=new FormData();
						form_data.append("file", fichier);
						form_data.append("action", "upload_image");
						form_data.append("filename", that.editor.courseFolder);
						$.ajax({
							url: "../../editor.php",
							method:"POST",
							data:form_data,
							contentType:false,
							cache:false,
							processData:false,
							beforeSend:function(){
								$("#uploaded_image").html("Image Uploading ... ")
							},
							success:function(data){
								

								data=JSON.parse(data);
								var filename=data.filename;
								//console.log(data);
								var newSrc="content/medias/images/"+filename;
								
								that.changeImage(newSrc);
								
								//that.$el.children("img").attr("src", newSrc);
								//$.magnificPopup.close();
							}
							
							
						})
					}
					
					
					
				}
			});
			
		},
/*---------------------------------------------------------------------------------------------
-------------------------
---------------------------------------------------------------------------------------------*/			
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});