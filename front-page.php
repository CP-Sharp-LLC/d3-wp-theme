<?php
try{
$d3menuData = get_d3menudata();
echo("<script type='text/javascript'>var d3menudata = $d3menuData;</script>");
}
catch(Exception $e)
{
	echo $e->getMessage();	
}

genesis();
