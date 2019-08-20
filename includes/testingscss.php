<?php

//Main debug switch
$dbugmode = false;
if($dbugmode){
    error_reporting(E_ALL);
}

//http://leafo.github.io/scssphp/docs/

require_once "scssphp/scss.inc.php";

use Leafo\ScssPhp\Compiler;

$scss = new Compiler();

////////////////////////////////////////////////////////////
//STRAIGHT TEST

// echo $scss->compile('
// @mixin font-size($n) {
//   font-size: $n * 1.2em;
// }
// body {
//   @include font-size(2);
// }
// ');

////////////////////////////////////////////////////////////
//IMPORT TEST

// $mainFile = 'themes/main.scss';
// $mainFileContents = file_get_contents($mainFile);
// clDisp($scss->compile($mainFileContents));

////////////////////////////////////////////////////////////
// TYPICAL SNAP! SCHEMA TEST

// $mainFile = 'snap/theme/scss/theme.scss';

// $mainFile = 'snap/core/scss/launch.scss';
// $mainFileContents = file_get_contents($mainFile);

// clDisp($scss->compile($mainFileContents));

////////////////////////////////////////////////////////////
// LOOP THROUGH SCSS FILES + FIND PARTIALS TEST

// $dir = new DirectoryIterator('./snap/');
// foreach ($dir as $fileinfo) {
//     if (!$fileinfo->isDot()) {
//         //var_dump($fileinfo->getFilename());
//         echo($fileinfo->getFilename());
//     }
// }

////////////////////////////////////////////////////////////
// LOOP THROUGH SCSS FILES + FIND PARTIALS, PATHS TEST 2
/*
$scssfiles = []; // should include every .scss files
$scsspaths = []; // For pathfinding scss's @imports
$scssnonpartials = []; // Keep listing of non partials
$dir = new RecursiveDirectoryIterator('./snap/');
foreach (new RecursiveIteratorIterator($dir) as $filename => $file) {
    if(strpos($filename,'.scss') !== false){
    	array_push($scssfiles, $filename);
    	if(strpos(pathinfo($filename, PATHINFO_FILENAME), '_') === false){
	    	array_push($scssnonpartials, $filename);
    	}
    }
    // echo pathinfo($filename, PATHINFO_FILENAME) . ' "_" ' . strpos(pathinfo($filename, PATHINFO_FILENAME), '_') .  '<br>';
    // echo strpos(pathinfo($filename, PATHINFO_FILENAME), '_');
    // echo $filename . ' - ' . $file->getSize() . ' bytes <br/>';
}

echo '<br><br><br>Path + files<br><br><br>';

$lb = '';
foreach($scssfiles as $x => $x_value) {
    if(pathinfo($x_value, PATHINFO_DIRNAME) != $lb){
	    echo '<br><br>' . pathinfo($x_value, PATHINFO_DIRNAME) . '<br>';
	    $lb = pathinfo($x_value, PATHINFO_DIRNAME);
    }
    //Echo file
    // echo $x . " - " . $x_value . '<br>';
    // echo $x . " - " . pathinfo($x_value, PATHINFO_FILENAME) . '<br>';
    echo pathinfo($x_value, PATHINFO_FILENAME) . '.' . pathinfo($x_value, PATHINFO_EXTENSION) . '<br>';
}

echo '<br><br><br>Non partials<br><br><br>';

foreach ($scssnonpartials as $x => $y) {
	echo $y . '<br>';
}
*/

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

if($dbugmode){
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
if($dbugmode){
    $formatterName = 'Leafo\ScssPhp\Formatter\Debug';
    // $formatterName = 'Leafo\ScssPhp\Formatter\Expanded';
}else{
    $formatterName = 'Leafo\ScssPhp\Formatter\Expanded';
    // $formatterName = 'Leafo\ScssPhp\Formatter\Crunched';
}
$scss->setFormatter($formatterName);

//Help with Debug
if($dbugmode){
    $scss->setLineNumberStyle(Compiler::LINE_COMMENTS);
}

//Set Paths
//→ Loop through partials paths
foreach($scsspaths as $x => $y){
    // $scss->setImportPaths($y);
    $scss->addImportPath($y);
}

//Set SourceMap (disabled for now)
/*$scss->setSourceMap(Compiler::SOURCE_MAP_INLINE);
$scss->setSourceMapOptions([
    'sourceMapWriteTo'  => '/var/www/vhost/my-style.map',
    'sourceMapURL'      => 'content/themes/THEME/assets/css/my-style.map',
    'sourceMapFilename' => 'my-style',
    'sourceMapBasepath' => '/var/www/vhost',
    'sourceRoot'        => '/',
]);*/

//IT'S COMPILE TIME!
foreach($scssnonpartials as $x => $y){

    //Load non-partial content for compiling
    // $mainFileContents = file_get_contents($scssnonpartials[1]);
    if($dbugmode){
        echo '→ COMPILING: '.$y . '<br>';
    }
    $mainFileContents = file_get_contents($y);
    // $mainFileContents = file_get_contents($scssnonpartials[2]);


    //Fixing #$^$% ./ path issue

    //TRY 1: find @imports
    // if(strpos($mainFileContents,'@import')){
    //     echo 'found one!';
    // }
    // $positions = array();
    // $lastPos = 0;
    // while (($lastPos = strpos($mainFileContents, '@import', $lastPos))!== false) {
    //     $positions[] = $lastPos;
    //     $lastPos = $lastPos + strlen($needle);
    // }
    // foreach ($positions as $value) {
    //     echo $value ."<br />";
    // }

    //TRY 2: find @imports

    // $aPos = 0;
    // $offsetPos = 0;
    // for($i=0;$i<100;$i++){
    //     $aPos = strpos($mainFileContents,'@import',$offsetPos);
    //     if($aPos !== false){

    //         echo '<br>@IMPORT FOUND: ' . $aPos. ' ... '. strpos($mainFileContents,"\n",$aPos) . ' = ' . substr($mainFileContents,$aPos,strpos($mainFileContents,"\n",$aPos)-$aPos) . '<br>';

    //         $offsetPos = $aPos + 1;
    //     }else{
    //         $offsetPos = 101;
    //         break;
    //     }
    // }

    //TRY 3: Find @imports

    // $splitStr = explode('@import ',$mainFileContents);

    // echo '---SPLIT---';
    // foreach($splitStr as $x => $y) {
    //     echo $x. ' - ' . $y . '<br>';
    // }
    

    //END Fixing #$^$% ./ path issue

    //Confirm file destination vs path rectifier


    $rectifyPath = false;
    $fileDest = "";

// echo '<br>' .sizeof($pathrectifier). '<br>';
    if($pathrectifier[0] != ""){
        foreach($pathrectifier as $xx => $yy){
            // echo $xx . ' - ' . str_replace('/','\\',$yy) . ' vs ' . $y . '<br>';
            // if(strpos($y, str_replace('/','\\',$yy))!== false){
            if(strpos($y, explode(':',str_replace('/','\\',$yy))[0])!== false){

// echo $y . ' vs ' . explode(':',str_replace('/','\\',$yy))[0] . ' ← FOUND IT, GOES INTO: ' . explode(':',str_replace('/','\\',$yy))[1] . '<br>';
                $fName = explode('\\',$y);
// print_r($fName);
// echo 'len:' . sizeof($fName);
                $fName = $fName[sizeof($fName)-1];

                $fileDest = $rootpath . explode(':',str_replace('/','\\',$yy))[1] . $fName;
                $fileDest = str_replace('/','\\',$fileDest);
                $rectifyPath = true;
                break;
            }
        }
    }
    //If no path rectifier, use default non-partial path
    if(!$rectifyPath){
        $fileDest = $y;
    }

    //Make it CSS!
    $fileDest = str_replace('.scss', '.cssc', $fileDest);


    if($dbugmode){
        echo '<br>File content ' . ($rectifyPath ? '(rectified)':'') . ' destination:' . $fileDest ;
        //Display only
        clDisp($scss->compile($mainFileContents));
    }else{
        //Generate file
        try {
            fCreateFile($fileDest,$scss->compile($mainFileContents));
        } catch (\Exception $e) {
            echo LOG_ERR . 'scssphp: Unable to compile content, see log for details.';
            syslog(LOG_ERR, 'scssphp: Unable to compile content, see log for details.');
        }
    }

    //Official version (generate files according to path rectifier)

}

//Compile


////////////////////////////////////////////////////////////
//FUNCTIONS
////////////////////////////////////////////////////////////


//Clean Display
function clDisp($str){
	echo '<pre>' . nl2br(str_replace("\t", '&nbsp;&nbsp;&nbsp;&nbsp;', $str)) . '</pre>';
}

//Generate file (fullpath/filename,contents,options(?))
function fCreateFile($fPath,$fContents){

    //Add >@charset "UTF-8"; on first line, save file as UTF-8 obviously!
    $cFile = fopen($fPath, "w") or die("Unable to open file!");
    fwrite($cFile, $fContents);
    fclose($cFile);
};

?>
