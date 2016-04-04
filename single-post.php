<?php
add_action('wp_enqueue_scripts', 'cp_single_post');
function cp_single_post()
{
	$postid = $_GET['p'];
	wp_register_script( 'single-post', get_stylesheet_directory_uri() . '/js/post.js', array('cpd3ui'), '1.0.0', true );
	wp_localize_script('single-post', 'singlepost', array(
		"postdata" => cp_getjsonpost($postid))
	);
	wp_enqueue_script('single-post');
}

genesis();
