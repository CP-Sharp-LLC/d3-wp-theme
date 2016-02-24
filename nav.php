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
				return new NavMapData ( "App.Map.logocolors.bluering", 2, "topleft" );
			case "tech" :
				return new NavMapData ( "App.Map.logocolors.greenring", 34, "bottom" );
			case "services" :
				return new NavMapData ( "App.Map.logocolors.purplering", 18, "topleft" );
			case "contact" :
				return new NavMapData ( "App.Map.logocolors.redring", 26, "bottomleft" );
			case "folio" :
				return new NavMapData ( "App.Map.logocolors.orangering", 50, "top" );
		}

		return null;
	}
}

function get_d3menudata() {
	$rootcat = get_categories(array('slug' => 'root'));
	$parentnodes = get_categories(array('parent' => $rootcat[0]->cat_ID, 'hide_empty' => 0));
	$menuitems = array();

	foreach ( $parentnodes as $node ) {
		$childitems = get_d3childitems ( $node->slug );

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

function get_d3childitems($cat) {
	$childitems = array ();
	$catitems = get_posts( array ( 'category_name' => $cat, 'posts_per_page' => -1 ) );
	foreach ( $catitems as $item ) {
		array_push ( $childitems, array (
				'tident' => $item->ID,
				'text' => $item->post_title,
				'target' => $item->ID
		) );
	}
	
	return $childitems;
}
