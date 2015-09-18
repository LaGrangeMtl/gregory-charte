<?php

$basePath = 'http://localhost/_github/LaGrangeMtl/gregory-charte/';
$pages = array(
	'index.php' => 'index',
);



	foreach($pages as $baseLink=>$filename){
		$filename = $filename . '.html';

		$url = $basePath . $baseLink;
		//die($url);
		$cnt = file_get_contents($url);

		//$n = substr_count($cnt, 'index.php');
		//echo "<p>$filename : $n instances de index.php</p>";

		file_put_contents($filename, $cnt);

	}
