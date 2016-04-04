/* globals GlobalManager, d3 */

var cp = new GlobalManager();

$( document ).ready( function () {
	cp.processreadyqueue();
} );

var App = {
	debug      : false,
	body       : null,
	status     : null,
	warned     : false,
	childnodes : [],
	angles     : cp.angles,
	socialmedia: cp.socialmedia,

	ready: function () {
		this.childnodes = cp.createchildnodes();
		this.body = d3.select( "body" );
		var windowWidth = $( window ).width();
		App.Map.svg = d3.select( cp.primarycontainer ).insert( "svg:svg", ":first-child"  ).attr( "width", windowWidth ).attr( "height", $( window ).height() );
		var footer = d3.select( '#footer' );
		var footerJq = $( '#footer' );
		footerJq.css( "top", $( window ).height() - footerJq.height() - 5 );

		var socialMedia = d3.select( '#socialmedia' );
		this.socialmedia.forEach( function (image, i, arrayGroup) {
			socialMedia.append( "a" ).attr( 'href', image.link )
				.append( "img" )
				.attr( "src", image.image )
				.attr( "alt", image.alt );
		} );

		cp.addready( App.Map, App.Map.draw );
	},
};