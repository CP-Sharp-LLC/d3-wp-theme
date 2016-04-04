<?php
    /**
	 * Template Name: Fun Template
	 * Description: Used for CPSharp.net tools, basic page.
	 */

	 add_action('wp_enqueue_scripts', 'cp_tools');
	 function cp_tools()
	 {
		 wp_enqueue_style( 'meet', get_stylesheet_directory_uri() . '/style/meet.css', array(), PARENT_THEME_VERSION );
		 wp_enqueue_style( 'buttonsstyle', get_stylesheet_directory_uri() . '/style/buttons.css', array(), PARENT_THEME_VERSION );
		 wp_enqueue_script( 'meetscript', get_stylesheet_directory_uri() . '/js/meet.js', array('cpd3app', 'd3', 'gstween', 'gscss', 'gsease'));
	 }

	add_action('genesis_after', 'cp_scriptload');
	function cp_scriptload()
	{
		echo("<div id='page2'>");
		the_content();
		echo("</div>");
	}

	genesis();
?>
<script type='text/javascript'>
$(document).ready(function() {
	for(var i = 0; i < App.childnodes.length; i++)
	{
		if(App.childnodes[i].tident == "tech")
		{
			App.Map.selectedparent = App.childnodes[i];
			App.Map.selectedparent.childDetail = App.childnodes[i];
			break;
		}
	}

	setTimeout(function () { App.Map.UI.shownextpage(new Logocolor({ r:0, g:41, b:51}).a(1));} , delayLength);
})
</script>
