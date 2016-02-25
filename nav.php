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
