<?php
//USAGE
/*

$.post('LOM/includes/compile_sass.php', { action:"compile_sass"}, function(){
    }).fail(function() {
        alert( "Sass compilation failed." );
    });

- OR -

compile_sass.php?action=compile_sass

*/

//generate source maps?
$generateSourceMap = false;

//Deal with calling methodology (file simply called? output... action = compile_sass? generate file(s) )
if((isset($_POST['action']) && $_POST['action'] === 'compile_sass') || (isset($_GET['action']) && $_GET['action'] === 'compile_sass')){
    $debugMode = false;
}else{
    $debugMode = true;
}

//Turn off errors unless debugging
if($debugMode){
    error_reporting(E_ALL);
}


//http://leafo.github.io/scssphp/docs/
require_once "scssphp/scss.inc.php";
use Leafo\ScssPhp\Compiler;
$scss = new Compiler();


////////////////////////////////////////////////////////////
// SETUP

$rootpath = '../../'; // base path for scanning
$packagepath = $rootpath . 'package.json'; // where to find the package.json (usually in root)
$scssfiles = []; // list every .scss files
$scsspaths = []; // list all paths to .scss files
$scssnonpartials = []; // list all non-partials files

// echo realpath(dirname(__FILE__));


// Utils
$lb = ''; // Lookbacker
$packageaccess = ['watch-css','sass --watch ']; // storing needles

////////////////////////////////////////////////////////////
// STEP 1 - Find/store all .scss files and paths including non-partials

$dir = new RecursiveDirectoryIterator($rootpath);
foreach (new RecursiveIteratorIterator($dir) as $filename => $file) {
    //Test against anything *.scss && not /.sass-cache/
    if(strpos($filename,'.scss') !== false && strpos($filename,'.sass-cache') != true){
    	array_push($scssfiles, $filename); //Store partials
    	if(strpos(pathinfo($filename, PATHINFO_FILENAME), '_') === false){
	    	array_push($scssnonpartials, $filename); //Store non-partials
    	}
    }
}

foreach($scssfiles as $x => $x_value) {
    if(pathinfo($x_value, PATHINFO_DIRNAME) != $lb){
	    $lb = pathinfo($x_value, PATHINFO_DIRNAME);
	    array_push($scsspaths, pathinfo($x_value, PATHINFO_DIRNAME)); //Store paths
    }
}
unset($lb); // Remove useless



////////////////////////////////////////////////////////////
// Step 2 - Read package.json for details on where to compile ($packageaccess)

$packagefile = file_get_contents($packagepath); // open package.json
$packageobj = json_decode($packagefile, true); // decode json
$pathrectifier = explode(' ',str_replace($packageaccess[1],'',$packageobj['scripts'][$packageaccess[0]])); // "split" params


//Log/Confirm Everything so far

if($debugMode){
    echo '<br><br><br><br>ALL FILES : SCSS<br><br><br><br>';
    foreach ($scssfiles as $x => $y) {echo $y . '<br>';}
    echo '<br><br><br><br>PATHS : Includes<br><br><br><br>';
    foreach ($scsspaths as $x => $y) {echo $y . '<br>';}
    echo '<br><br><br><br>NON-PARTIAL : Importers<br><br><br><br>';
    foreach ($scssnonpartials as $x => $y) {echo $y . '<br>';}
    echo '<br><br><br><br>PACKAGE.JSON : Path rectifiers<br><br><br><br>';
    foreach($pathrectifier as $x => $y){echo $y . '<br>';}
}

////////////////////////////////////////////////////////////
// Step 3 - Setup compiler

// echo '<br>'.$scssnonpartials[1].'↓↓↓↓↓↓↓';

//Formatting options
// Leafo\ScssPhp\Formatter\Debug
// Leafo\ScssPhp\Formatter\Expanded
// Leafo\ScssPhp\Formatter\Nested
// Leafo\ScssPhp\Formatter\Compressed
// Leafo\ScssPhp\Formatter\Compact
// Leafo\ScssPhp\Formatter\Crunched

//Set formatting
if($debugMode){
    // $formatterName = 'Leafo\ScssPhp\Formatter\Debug';
    $formatterName = 'Leafo\ScssPhp\Formatter\Expanded';
}else{
    $formatterName = 'Leafo\ScssPhp\Formatter\Expanded';
    // $formatterName = 'Leafo\ScssPhp\Formatter\Crunched';
}
$scss->setFormatter($formatterName);

//Help with Debug
if($debugMode){
    $scss->setLineNumberStyle(Compiler::LINE_COMMENTS);
}

//Set Paths
//→ Loop through partials paths
foreach($scsspaths as $x => $y){
    // $scss->setImportPaths($y);
    $scss->addImportPath($y);
}

//Generate SourceMap (not setup properly for file for now, only inline)
if($generateSourceMap){
    // $scss->setSourceMap(Compiler::SOURCE_MAP_FILE);
    $scss->setSourceMap(Compiler::SOURCE_MAP_INLINE);
    $scss->setSourceMapOptions([
        'sourceMapWriteTo'  => '/var/www/vhost/my-style.map',
        'sourceMapURL'      => 'content/themes/THEME/assets/css/my-style.map',
        'sourceMapFilename' => 'my-style',
        'sourceMapBasepath' => '/var/www/vhost',
        'sourceRoot'        => '/',
    ]);
}

//IT'S COMPILE TIME!
foreach($scssnonpartials as $x => $y){
    if($debugMode){
        echo '→ COMPILING: '.$y . '<br>';
    }

    //Load non-partial content for compiling
    $mainFileContents = file_get_contents($y);

    //Confirm file destination vs path rectifier
    $rectifyPath = false;
    $fileDest = "";

    //Check if path needs rectifying
    if($pathrectifier[0] != ""){

        foreach($pathrectifier as $xx => $yy){
            if(strpos($y, explode(':',str_replace('/','\\',$yy))[0])!== false){
                //String magic
                $fName = explode('\\',$y);
                $fName = $fName[sizeof($fName)-1];
                $fileDest = $rootpath . explode(':',str_replace('/','\\',$yy))[1] . $fName;
                $fileDest = str_replace('/','\\',$fileDest);
                //File to be created
                $rectifyPath = true;
                break;
            }
        }
    }
    //If no path rectifier, use default non-partial path
    if(!$rectifyPath){
        $fileDest = $y;
    }

    //Make it CSS extension!
    $fileDest = str_replace('.scss', '.css', $fileDest);

    //Generate file or just display results
    if($debugMode){
        echo '<br>File content ' . ($rectifyPath ? '(rectified)':'') . ' destination:' . $fileDest ;
        //Display only
        clDisp($scss->compile($mainFileContents));
    }else{
        //Generate file (unless issue)
        try {
            fCreateFile($fileDest,$scss->compile($mainFileContents));
        } catch (\Exception $e) {
            echo LOG_ERR . 'scssphp: Unable to compile content, see log for details.';
            syslog(LOG_ERR, 'scssphp: Unable to compile content, see log for details.');
        }
    }

    //the end, return something, maybe confirm?
}



////////////////////////////////////////////////////////////
//FUNCTIONS
////////////////////////////////////////////////////////////


//Clean Display (<pre>) of results
function clDisp($str){
	echo '<pre>' . nl2br(str_replace("\t", '&nbsp;&nbsp;&nbsp;&nbsp;', $str)) . '</pre>';
}

//Generate file (fullpath/filename,contents,options(?))
function fCreateFile($fPath,$fContents){
    //Add >@charset "UTF-8"; on first line, save file as UTF-8 obviously!
    $cFile = fopen($fPath, "w") or die("Unable to open file!");
    fwrite($cFile, pack("CCC",0xef,0xbb,0xbf)); //UTF-8 BOM
    fwrite($cFile, $fContents);
    fclose($cFile);
};

?>
