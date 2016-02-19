<?php
    /**
	 * Template Name: Tool Template
	 * Description: Used for CPSharp.net tools, basic page.
	 */

	 add_action('wp_enqueue_scripts', 'cp_tools');
	 function cp_tools()
	 {
	 	wp_enqueue_script( 'angular', get_stylesheet_directory_uri() . '/lib/angular.js', array(), '1.0.0', true );
		if(is_page('css-background-tool'))
		{
			wp_enqueue_script( 'css-background-js', get_stylesheet_directory_uri() . '/js/tool/css-background.js', array('angular'), '1.0.0', true );
		}
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

	App.Map.UI.setp2bg("/wp-content/uploads/2015/09/toolbg.png");
	App.Map.UI.shownextpage();
})
</script>
