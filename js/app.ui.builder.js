/* globals d3, cp, App, TweenLite, Power1, Power2, Power3, Back, cpd3coreserverside */
App.Map.UI.Builder = {
	modalelement: $( '#modal-container' ),
	modalcontent: $( '#modal-content' ),
	page2element: App.Map.p2.children( '#page2content' ),

	show : {
		scrolldown2: function (content) {
			var backcolor = "rgba(0,0,0,1)";
			var windowHeight = $( window ).height();
			var windowWidth = $( window ).width();
			App.Map.p2.height( $( window ).height() );
			App.Map.p2.css( 'maxheight', windowHeight );
			App.Map.p2.width( $( window ).width() );
			App.Map.p2.css( 'maxheight', windowWidth );
			App.Map.p2.css( "background", "rgba(0, 0, 0, 0) url('" + content.bgimage[ 0 ] + "') no-repeat 50% 100%" );
			App.Map.p2.css( "background-size", "cover" );
			TweenLite.to( App.Map.svg, 1, { ease: Power3.easeOut, opacity: 0 } );
			TweenLite.to( App.body, 1, { ease: Power3.easeOut, "background-color": backcolor } );
			TweenLite.to( cp, 1, {
				ease          : Power3.easeIn,
				scroll        : App.Map.p2.offset().top,
				onUpdate      : cp.updatescroll,
				onUpdateParams: [ function () {
					return cp.scroll;
				} ]
			} );

			var pageinfos = [];
			$( content.content ).each( function (key, value) {
				var newval = $( value );
				if (newval.hasClass( 'exploder' )) {
					var data = JSON.parse( newval.attr( 'layout' ) );
					data.title = false;
					if (newval.children( 'span' ).length === 2)
					{
						data.text = newval.children( 'span' )[ 0 ].innerText;
						data.subtext = newval.children( 'span' )[ 1 ].innerText;
					}
					else if (newval.hasClass( 'title' )) {
						data.text = newval.text();
						data.title = true;
					}
					pageinfos.push( data );
				}
			} );

			var p2svg = d3.select( '#page2content' ).append( "svg:svg" ).attr( "width", windowWidth ).attr( "height", windowHeight );
			var circles = p2svg.selectAll( 'circle' ).data( pageinfos );
			var texts = p2svg.selectAll( 'text' ).data( pageinfos );
			var lines = p2svg.selectAll( 'line' ).data( pageinfos );

			lines.enter().append( 'svg:line' );
			circles.enter().append( "svg:circle" );
			texts.enter().append( "svg:text" );
			texts.text( function (d) {
					return d.text;
				} )
				.attr( "x", function (d) {
					return d.x * windowWidth * 0.95;
				} )
				.attr( "y", function (d) {
					return d.y * windowHeight;
				} )
				.attr( "font-size", function (d) {
					if (d.title) {
						return "2em";
					}
					return "1.5em";
				} )
				.attr( "fill", "white" )
				.attr( "text-anchor", "middle" );

			circles.attr( "r", function (d) {
					return d.d * windowHeight;
				} )
				.attr( "cx", function (d) {
					return d.x * windowWidth * 0.95;
				} )
				.attr( "cy", function (d) {
					return d.y * windowHeight;
				} )
				.attr( 'style', function (d) {
					return 'fill: ' + d.color;
				} );

			texts.exit().remove();
			circles.exit().remove();

		},
		scrolldown : function (content) {
			var backcolor = cp.nullundef( content.content.overridecolor ) ? App.Map.selectedparent.childDetail.color.a( 0.4 ).toString() : content.content.overridecolor;

			var windowHeight = $( window ).height();
			var windowWidth = $( window ).width();
			App.Map.p2.height( $( window ).height() );
			App.Map.p2.css( 'maxheight', windowHeight );
			App.Map.p2.width( $( window ).width() );
			App.Map.p2.css( 'maxheight', windowWidth );

			TweenLite.to( App.Map.svg, 1, { ease: Power3.easeOut, opacity: 0 } );
			TweenLite.to( App.body, 1, { ease: Power3.easeOut, "background-color": backcolor } );
			TweenLite.to( cp, 1, {
				ease          : Power3.easeIn,
				scroll        : App.Map.p2.offset().top,
				onUpdate      : cp.updatescroll,
				onUpdateParams: [ function () {
					return cp.scroll;
				} ]
			} );
			App.Map.UI.newcontent.page2element.html( content.content );
		},
		dialog     : function (content) {
			App.Map.UI.newcontent.modalcontent.html( content.content );
			App.Map.UI.newcontent.modalelement.removeAttr( 'class' ).addClass( 'seven' );
		}
	},
	setup: {
		scrolldown2: function (teardown) {
			d3.select( '.backcontainer' ).on( "click", function () {
				teardown( 'click' );
			} );
			$( '.backcontainer' ).hover( function () {
				$( '.backcontainer' ).toggleClass( "anim" );
			} );
		},
		scrolldown : function (teardown) {
			d3.select( "body" ).on( "keyup", function () {
				if (d3.event.keyCode === cp.keycode.esc) {
					teardown( 'escapekey' );
				}
			} );
		},
		dialog     : function (teardown) {
			App.Map.UI.newcontent.modalelement.click( function () {
				teardown( 'click' );
			} );
		}
	},

	hide: {
		scrolldown2: function (info) {
			d3.event.stopPropagation();
			$( '.back' ).off( "mouseenter mouseleave" );
			$( '.back' ).removeClass( 'anim' );
			TweenLite.to( cp, 1, {
				ease          : Power3.easeOut, scroll: 0, onComplete: function () {
					App.Map.p2.height( 0 );
				}, onUpdate   : cp.updatescroll,
				onUpdateParams: [ function () {
					return cp.scroll;
				} ]
			} );
			TweenLite.to( App.Map.svg, 1, { ease: Power2.easeIn, opacity: 1 } );
			TweenLite.to( App.body, 1, {
					ease              : Power3.easeIn,
					"background-color": (cp.nullundef( App.Map.selectedparent )) ? "rgba(0,0,0,1)" : App.Map.selectedparent.childDetail.color.dark( 6 ).toString()
				}
			);
			App.Map.force.start();
		},
		scrolldown : function (info) {
			d3.event.stopPropagation();
			TweenLite.to( cp, 1, {
				ease          : Power3.easeOut, scroll: 0, onComplete: function () {
					App.Map.p2.height( 0 );
				}, onUpdate   : cp.updatescroll,
				onUpdateParams: [ function () {
					return cp.scroll;
				} ]
			} );
			TweenLite.to( App.Map.svg, 1, { ease: Power2.easeIn, opacity: 1 } );
			TweenLite.to( App.body, 1, {
				ease              : Power3.easeIn,
				"background-color": App.Map.selectedparent.childDetail.color.dark( 6 ).toString()
			} );
			App.Map.force.start();
		},
		dialog     : function (info) {
			App.Map.UI.newcontent.modalelement.addClass( 'out' );
		}
	},
}