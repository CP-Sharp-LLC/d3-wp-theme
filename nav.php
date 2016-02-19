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
			case "about" :
				return new NavMapData ( "App.Map.logocolors.bluering", 2, "right" );
			case "tech" :
				return new NavMapData ( "App.Map.logocolors.greenring", 34, "bottom" );
			case "service" :
				return new NavMapData ( "App.Map.logocolors.purplering", 18, "topleft" );
			case "contact" :
				return new NavMapData ( "App.Map.logocolors.redring", 26, "bottomleft" );
			case "portfolio" :
				return new NavMapData ( "App.Map.logocolors.orangering", 50, "top" );
		}
	}
}

function get_d3menudata() {
	$parentnodes = get_categories();
	
	foreach ( $parentnodes as $node ) {
		$childitems = get_d3childitems ( $node->slug );
		return json_encode($childitems);
		$hacky = NavMapData.feed($node->slug);
		
		$children = array (
				'branchDirection' => $hacky->branch,
				'items' => $childitems 
		);
		
		$menuitem = array (
				'tident' => $node->slug, 'text' => $node->name,
				'color' => $hacky->color, 'vertex' => $hacky->vertex,
				'children' => $children 
		);
	}
	
	return json_encode ( $menuitems );
}

function query_catitems($catname)
{
	return get_posts( array ( 'category_name' => '$catname', 'posts_per_page' => -1 ) );
}

function get_d3childitems($cat) {
	$childitems = array ();
	$catitems = query_catitems ( $cat );
	return $catitems;
	foreach ( $catitems as $item ) {
		array_push ( $childitems, array (
				'tident' => $cat,
				'text' => $item->text,
				'target' => $item->target 
		) );
	}
	
	return $childitems;
}


/*
 * new ChildNode({tident:"about", text:"about us", color: , vertex: 2, image: "",
 * children: {branchDirection: "right",
 * items:
 * [
 * {tident: "team", text:"our team", target:"sideload.php?id=1"},
 * {tident: "clients", text:"our clients",target:"sideload.php?id=1"},
 * {tident: "founder", text:"founder",target:"sideload.php?id=1"},
 * {tident: "vision", text:"something",target:"sideload.php?id=1"},
 * {tident: "smth3", text:"vision",target:"sideload.php?id=1"},
 * ]}
 * }),
 * new ChildNode({tident:"tech", text:"tech", color: , vertex: 34, image: "",
 * children: {branchDirection: "bottom",
 * items:
 * [
 * {tident: "blog", text:"blog"},
 * ]}}),
 * new ChildNode({tident:"service", text:"services", color: App.Map.logocolors., vertex: 18, image: "",
 * children: {branchDirection: "topleft",
 * items:
 * [
 * {tident: "mobile", text:"mobile apps"},
 * {tident: "web", text:"web design"},
 * ]}}),
 * new ChildNode({tident:"contact", text:"contact", color: App.Map.logocolors., vertex: 26, image: "",
 * children: {branchDirection: "bottomleft",
 * items:
 * [
 * {tident: "email", text:"email"},
 * ]}}),
 * new ChildNode({tident:"portfolio", text:"folio", color: App.Map.logocolors., vertex: 50, image: "",
 * children: {branchDirection: "top",
 * items:
 * [
 * {tident: "webportfolio", text:"web design"},
 * ]}})
 */

?>
