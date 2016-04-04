<?php
class NavMapData {
	public $color;
	public $vertex;
	public $branch;
	
	function __construct($color, $vertex, $branch) {
		$this->color = $color;
		$this->vertex = $vertex;
		$this->branch = $branch;
	}

	public static function feed($cat) {
		switch ($cat) {
			case "aboutus" :
				return new NavMapData ( "bluering", 2, "left" );
			case "tech" :
				return new NavMapData ( "greenring", 34, "bottom" );
			case "services" :
				return new NavMapData ( "purplering", 18, "topleft" );
			case "contact" :
				return new NavMapData ( "redring", 26, "bottomleft" );
			case "folio" :
				return new NavMapData ( "orangering", 50, "top" );
		}

		return null;
	}
}

function get_d3menudata() {
	$rootcat = get_categories(array('slug' => 'root'));
	$parentnodes = get_categories(array('parent' => $rootcat[0]->cat_ID, 'hide_empty' => 0));
	$menuitems = array();

	foreach ( $parentnodes as $node ) {
		$childitems = array ();
		$catitems = get_posts( array ( 'category_name' => $node->slug, 'posts_per_page' => -1 ) );
		foreach ( $catitems as $item ) {
			array_push ( $childitems, array (
				'tident' => $item->ID,
				'text' => $item->post_title,
				'target' => $item->ID
			) );
		}

		$hacky = NavMapData::feed($node->slug);
		
		$children = array (
				'branchDirection' => $hacky->branch,
				'items' => $childitems 
		);
		
		$menuitem = array (
				'tident' => $node->slug, 'text' => $node->name,
				'color' => $hacky->color, 'vertex' => $hacky->vertex,
				'children' => $children 
		);

		array_push($menuitems, $menuitem );
	}
	
	return json_encode ( $menuitems );
}

add_action('wp_enqueue_scripts', 'cp_d3_layout');
function cp_d3_layout()
{
	wp_enqueue_style('modals', get_stylesheet_directory_uri() . '/style/modals.css', array(), PARENT_THEME_VERSION);
	wp_enqueue_script('jq', get_stylesheet_directory_uri() . '/lib/jquery.js', array(), '1.0.0', true);
	wp_enqueue_script('jqcookie', get_stylesheet_directory_uri() . '/lib/jquery.cookie.js', array('jq'), '1.0.0', true);
	wp_enqueue_script('d3', get_stylesheet_directory_uri() . '/lib/d3.js', array('jq'), '1.0.0', true);
	wp_enqueue_script('gstween', get_stylesheet_directory_uri() . '/lib/tweenlite.js', array('jq'), '1.0.0', true);
	wp_enqueue_script('gscss', get_stylesheet_directory_uri() . '/lib/gs.cssplugin.js', array('jq'), '1.0.0', true);
	wp_enqueue_script('gsease', get_stylesheet_directory_uri() . '/lib/gs.easepack.js', array('jq'), '1.0.0', true);

	$prereqs = array('d3', 'gstween', 'gscss', 'gsease');
	wp_register_script('cpd3core', get_stylesheet_directory_uri() . '/js/app.core.js', $prereqs, '1.0.0', true);
	$menudata = get_d3menudata();
	wp_localize_script('cpd3core', 'cpd3coreserverside', array(
		'childnodes' => $menudata,
		'ajaxurl' => admin_url('admin-ajax.php')
	));
	wp_enqueue_script('cpd3core');
	array_push($prereqs, 'cpd3core');

	wp_enqueue_script('cpd3app', get_stylesheet_directory_uri() . '/js/app.js', $prereqs, '1.0.0', true);
	array_push($prereqs, 'cpd3app');

	wp_enqueue_script('cpd3map', get_stylesheet_directory_uri() . '/js/app.map.js', $prereqs, '1.0.0', true);
	wp_enqueue_script('cpd3ui', get_stylesheet_directory_uri() . '/js/app.ui.js', $prereqs, '1.0.0', true);
	array_push($prereqs, 'cpd3ui');
	wp_enqueue_script('cpd3uibuild', get_stylesheet_directory_uri() . '/js/app.ui.builder.js', $prereqs, '1.0.0', true);
}

add_action('wp_ajax_nopriv_lazyload', 'cp_loadpage');
add_action('wp_ajax_lazyload', 'cp_loadpage');

function cp_loadpage()
{
	$targetpost = $_POST['target'];
	$result = cp_getjsonpost($targetpost);
	echo($result);
	die();
}