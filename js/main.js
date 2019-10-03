	"use strict";
$("document").ready(function(){

		$.post( "editor.php", { action: "getcourses", content:"" }, function(data){
			generateCourses(JSON.parse(data));
		} );
		$(".add-course").click(function(){
			initFolder();
		});
		$(".btn-submit").click(function (e) {
			
       		e.preventDefault();
			//check if there's a file
			if( document.getElementById("userfile").files.length === 0 ){
    			alert("no files selected");
			}else{
				initFolder("Please enter a folder name", true);
			}
			
       		
			
			
     });
	});
	

	function generateCourses(data){
		for (var i=0;i<data.length;i++){
			if(data[i]!=="_default" && data[i]!=="_download" && data[i]!=="_system"){
				appendCourse(data[i]);
			}

		}
	}

	function appendCourse(data){
		$(".courselist").append("<li data-course='"+data+"'></li>");
			var $el=$(".courselist").children("li").eq($(".courselist").children("li").length-1);
			$el.append("<a href='courses/"+data+"/index_en.html'>"+data+"</a>");
		

		// download
		
			$el.append("<button class='course-download ico-LOM-download snap-xs' lang='en' title='Download English'>Download English</button>");
			$el.append("<button class='course-download ico-LOM-download snap-xs' lang='fr' title='Download French'>Download French</button>");

		$el.children(".course-download").click(function(){downloadCourse($(this).parent().attr("data-course"), $(this).attr("lang"));});

		
		// DELETE
		$el.append("<button class='course-delete ico-LOM-trash snap-xs' title='Delete'>X</button>");
		$el.children(".course-delete").click(function(){deleteCourse($(this).parent().attr("data-course"));});	
	}

	function deleteCourse(course){
		//deletecourse
		$.post( "editor.php", { action: "deletecourse", content:"courses/"+course }, function(data){
			if(data==="true"){
				$("[data-course="+course+"]").remove();
			}
		});
	}

	function downloadCourse(course, lang){
		//deletecourse
		console.log(lang);
		$.post( "editor.php", { action: "zipfolder", filename:"courses/"+course, content:lang }, function(data){
			
			//console.log(data);
			startDownload(data);
		});
	}
		
	function startDownload(file){
		
		window.location = "courses/_download/"+file;
		setTimeout(function (){
			$.post( "editor.php", { action: "delete", filename:"courses/_download/"+file }, function(data){
			
				//document.location=data;
				console.log(data);
			});

		}, 10000);
		
	}

	function initFolder(errorMsg, isUpload){
		var folder=prompt((typeof errorMsg !== "undefined")?errorMsg:"Please enter folder name:");
		if (folder!==null){
			var validation=validateFolder(folder);

			if (validation ===true){
				if(!isUpload){
					addCourse(folder);
				}else{
					$("#folder").val(folder);
					// Do something...  
       				$("#upload").submit();
				}
			}else{
				initFolder(validation, isUpload);
			}	

		}
	}



	function validateFolder(folder){
		if (folder ===""){
			return "Please enter a folder name";
		}

		var folderString=validateFolderString(folder);
		if(folderString !==true){
			return "Invalid Character '"+folderString+"'";
		}

		if ($("[data-course='"+folder+"']").length>0){
			return "Please use a unique folder name";
		}

		return true;
	}


	function validateFolderString(str) {
		var code;

		for (var i=0;i<str.length; i++){
			code=str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
				!(code > 64 && code < 91) && // upper alpha (A-Z)
				!(code > 96 && code < 123) &&
				!(code === 45 || code === 95)

			   ) { // lower alpha (a-z)
			  return str.charAt(i);
			}
		}
		return true;

	}
		
	function uploadCourse(obj){
		
		obj.submit();
	}

	function addCourse(folder){
		
		$.post( "editor.php", { action: "addcourses", content:folder }, function(data){
			data=data;
			appendCourse(folder, false);
		});

	}
