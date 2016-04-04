<?php
require_once(get_template_directory() . '/lib/init.php');
require_once(get_stylesheet_directory() . '/nav.php');

define('CHILD_THEME_NAME', 'CP Sharp');
define('CHILD_THEME_URL', 'http://www.cpsharp.net/');

remove_filter('the_content', 'wpautop');
remove_filter('the_excerpt', 'wpautop');
add_theme_support('genesis-responsive-viewport');
add_filter('genesis_site_layout', '__genesis_return_full_width_content');
add_theme_support('html5');
add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
add_theme_support('genesis-structural-wraps', array('header', 'nav', 'subnav', 'site-inner', 'inner', 'footer'));
add_theme_support('custom-header', array('header-selector' => '.site-title a', 'header-text' => false, 'height' => 125, 'width' => 162));
remove_theme_support('genesis-footer-widgets');
genesis_unregister_layout('content-sidebar');
genesis_unregister_layout('sidebar-content');
genesis_unregister_layout('content-sidebar-sidebar');
genesis_unregister_layout('sidebar-content-sidebar');
genesis_unregister_layout('sidebar-sidebar-content');
unregister_sidebar('header-right');
unregister_sidebar('sidebar-alt');
remove_action('genesis_sidebar', 'genesis_do_sidebar');
remove_action('genesis_before_loop', 'genesis_do_breadcrumbs');
remove_action('genesis_entry_header', 'genesis_entry_header_markup_open', 5);
remove_action('genesis_entry_header', 'genesis_post_info', 12);
remove_action('genesis_entry_header', 'genesis_entry_header_markup_close', 15);
remove_action('genesis_entry_header', 'genesis_do_post_title');
remove_action('genesis_before_post_content', 'genesis_post_info');
remove_action('genesis_entry_content', 'genesis_do_post_content');
remove_action('genesis_post_title', 'genesis_do_post_title');
remove_action('genesis_entry_footer', 'genesis_post_meta');
remove_action('genesis_before_footer', 'genesis_footer_widget_areas');
remove_action('genesis_footer', 'genesis_footer_markup_open', 5);
remove_action('genesis_footer', 'genesis_do_footer');
remove_action('genesis_footer', 'genesis_footer_markup_close', 15);
remove_action('genesis_after_endwhile', 'genesis_posts_nav');
remove_action('genesis_header', 'genesis_do_header');
add_action('genesis_header', 'cp_do_header');

function cp_do_header()
{
	echo '<div id="header">';
	echo '<img src="/wp-content/uploads/2015/09/cropped-cpsharp11.png" alt="CP Sharp Logo">';
	echo '<span class="title">Innovative</span> <span class="title">Responsive</span> <span class="title">Technology</span>';
	echo '</div>';
	echo '<div id="socialmedia"></div>';
}

add_action('wp_enqueue_scripts', 'cp_google_fonts');
function cp_google_fonts()
{
	wp_enqueue_style('google-fonts', 'http://fonts.googleapis.com/css?family=Coda|Raleway:400,700,200', array(), PARENT_THEME_VERSION);
	wp_enqueue_style('google-fonts', "http://fonts.googleapis.com/css?family=PT+Sans+Narrow:regular,bold", array(), PARENT_THEME_VERSION);
}

add_action('genesis_after_footer', 'cp_page2');
function cp_page2()
{
	echo '<div id="page2"><div class="backcontainer">▲</div>
	<div id="page2content"></div></div>';
	echo '<div id="modal-container"><div class="modal-background"><div class="modal">';
	echo '<div id="modal-content"></div>';
	echo '<svg class="modal-svg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">';
	echo '<rect x="0" y="0" fill="none" width="226" height="162" rx="3" ry="3"></rect>';
	echo '</svg>';
	echo '</div></div></div>';
}

function cp_getjsonpost($postid)
{
	$requestedPost = get_post($postid);
	$displayType = get_post_custom_values('displaytype', $postid);
	if ($displayType == null) $displayType = 'scrolldown';
	switch ($displayType[0]) {
		case "scrolldown2":
			return json_encode(array(
				'error' => false,
				'content' => $requestedPost->post_content,
				'displaytype' => $displayType,
				'bgimage' => get_post_custom_values('bgimage', $postid)));
			break;
		default:
			return json_encode(array(
				'error' => false,
				'content' => $requestedPost->post_content,
				'displaytype' => $displayType));
	}
}