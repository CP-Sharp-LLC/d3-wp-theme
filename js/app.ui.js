/* globals d3, cp, App, TweenLite, Power1, Power2, Power3, Back, cpd3coreserverside */
App.Map.UI = {
	ready        : false,
	mmallowed    : false,
	makehighlight: function (d)
	{
		if (!App.Map.UI.ready || !App.Map.UI.mmallowed) {
			return;
		}

		TweenLite.to(
			App.body,
			0.3, {
				ease              : Power1.easeOut,
				"background-color": d.childDetail.color.dark( 6 ).toString()
			} );

		TweenLite.to(
			d.childDetail,
			0.3, {
				ease            : Back.easeOut.config( 4 ),
				r               : App.Map.childradius * 3.5,
				onStart         : App.Map.UI.d3init,
				onStartParams   : [ d, "#" + d.ident, "{self}" ],
				onComplete      : App.Map.UI.d3teardown,
				onCompleteParams: [ d, "#" + d.ident ],
				onUpdate        : App.Map.UI.d3caller,
				onUpdateParams  : [ d, "r", "#" + d.ident, function () {
					return d.childDetail.r;
				} ]
			} );

		TweenLite.to(
			d.childDetail,
			0.3, {
				ease          : Power3.easeOut,
				textopacity   : 1,
				onUpdate      : App.Map.UI.d3caller,
				onUpdateParams: [ d, "fill-opacity", "#" + d.childDetail.tident, function () {
					return d.childDetail.textopacity;
				} ]
			} );
	},

	unhighlight: function (d)
	{
		if (d.childDetail.selected || !App.Map.UI.ready || !App.Map.UI.mmallowed) {
			return;
		}

		TweenLite.to( App.body, 0.3, {
			ease              : Power1.easeIn,
			"background-color": App.Map.logocolors.black.a( 255 ).toString()
		} );

		TweenLite.to( d.childDetail, 0.3, {
			ease            : Back.easeIn.config( 4 ), r: App.Map.childradius,
			onStart         : App.Map.UI.d3init,
			onStartParams   : [ d, "#" + d.ident, "{self}" ],
			onComplete      : App.Map.UI.d3teardown,
			onCompleteParams: [ d, "#" + d.ident ],
			onUpdate        : App.Map.UI.d3caller,
			onUpdateParams  : [ d, "r", "#" + d.ident, function () {
				return d.childDetail.r;
			} ]
		} );

		TweenLite.to( d.childDetail, 0.3, {
			ease          : Power3.easeIn, textopacity: 0,
			onUpdate      : App.Map.UI.d3caller,
			onUpdateParams: [ d, "fill-opacity", "#" + d.childDetail.tident, function () {
				return d.childDetail.textopacity;
			} ]
		} );
	},

	expand: function (d)
	{
		var currentlySelected = d.childDetail.selected;
		App.Map.UI.deselect();
		d3.event.stopPropagation();
		if (currentlySelected) {
			return;
		}

		d.childDetail.selected = true;
		App.Map.selectedparent = d;

		var gcnodes = d3.range( 0, d.childDetail.children.items.length ).map( App.Map.Data.gc.map );
		var gcs = App.Map.getgrandchildren().data( gcnodes );
		gcs.enter().append( "circle" )
			.attr( "class", "grandchildnode" )
			.attr( "r", function () {
				return App.Map.childradius * 3;
			} )
			.attr( "fill", function () {
				return "gray";
			} )
			.attr( "cx", function () {
				return App.Map.selectedparent.x;
			} )
			.attr( "cy", function () {
				return App.Map.selectedparent.y;
			} )
			.attr( "fill-opacity", 0 )
			.on( "click", App.Map.UI.fireaction )
			.on("mouseover", App.Map.UI.overaction )
			.on("mouseout", App.Map.UI.outaction )
			.call( App.Map.force.drag );

		gcs.exit().remove();

		var grandchildren = App.Map.getgrandchildren();
		var gctext = App.Map.getgctext().data( gcnodes );
		gctext.enter()
			.append( "svg:text" )
			.classed( "gctext", true )
			.attr( "id", function (d) {
				return d.gcdetail.tident;
			} )
			.attr( "fill-opacity", 1 )
			.text( function (d) {
				return d.gcdetail.text;
			} )
			.on( "click", App.Map.UI.fireaction )
			.call( App.Map.force.drag );

		gctext.exit().remove();

		grandchildren
			.attr( "fill", function () {
				return d.childDetail.color;
			} )
			.attr( "fill-opacity", 1 );

		gcnodes.slice().forEach( function (target, i)
		{
			App.Map.gccount++;
			App.Map.nodes.push( gcnodes[ i ] );
			App.Map.links.push( { source: d, target: gcnodes[ i ], grandchild: true } );
		} );

		App.Map.force.nodes( App.Map.nodes );
		App.Map.force.links( App.Map.links );

		App.Map.drawlines();

		App.Map.force.start();
	},

	destroygc: function ()
	{
		var grandchildren = App.Map.getgrandchildren();

		grandchildren
			.classed( "grandchildnode", false )
			.attr( "fill", function (g, i) {
				return "gray";
			} )
			.attr( "cx", function (g, i) {
				return App.Map.selectedparent.x;
			} )
			.attr( "cy", function (g, i) {
				return App.Map.selectedparent.y;
			} )
			.attr( "fill-opacity", 0 );

		while (App.Map.gccount !== 0)
		{
			App.Map.nodes.pop();
			App.Map.links.pop();
			App.Map.gccount--;
		}

		App.Map.getgctext().remove();
		grandchildren.remove();
		App.Map.drawlines();
		App.Map.force.start();
	},

	deselect: function ()
	{
		App.childnodes.filter( function (n) {
				return n.selected;
			} )
			.forEach( function (m)
			{
				m.selected = false;
				var element = d3.select( "#v" + m.vertex );
				var data = element.data();
				App.Map.UI.unhighlight( data[ 0 ], element[ 0 ][ 0 ] );
			} );

		App.Map.UI.destroygc();

		App.Map.UI.refresh();
	},

	refresh: function ()
	{
		if (!this.ready) {
			return;
		}

		App.Map.gettexts()
			.attr( "x", function (d) {
				return d.x - this.clientWidth / 2;
			} )
			.attr( "y", function (d) {
				return d.y + 5;
			} );
	},

	handleclick: function ()
	{
		if (d3.event.defaultPrevented) {
			return;
		}

		App.Map.UI.deselect();
	},

	allowmousemove: function ()
	{ App.Map.UI.mmallowed = true; return App.Map.UI.d3teardown; },

	d3init: function (d, target, tweenInstance)
	{
		if (cp.nullundef( d.childDetail.tween )) {
			return;
		}

		if (d.childDetail.tween.has( target ))
		{
			d.childDetail.tween.get( target ).kill();
		}

		d.childDetail.tween.set( target, tweenInstance );
	},

	d3teardown: function (d, target)
	{
		if (d.childDetail.tween.has( target ))
		{
			d.childDetail.tween.remove( target );
		}
	},

	d3caller: function (d, attr, target, tvalue)
	{
		d3.select( target ).attr( attr, tvalue() );
	},

	mouseunhighlight: function (d)
	{
		var target = d3.select( this );
		App.Map.UI.unhighlight( d, target );
	},

	initdrag: function ()
	{
		App.Map.force.drag();
	},

	fireaction: function (d)
	{
		App.Map.UI.loadnextpage( d.gcdetail.target );
	},

	overaction: function (d, e, f)
	{
		console.log( d );
		console.log( e );
		console.log( f );
	},

	outaction: function (d, e, f)
	{
		console.log( d );
		console.log( e );
		console.log( f );
	},

	setp2bg: function (imageurl) {
		App.Map.p2.css( "background-image", "url(" + imageurl + ")" );
		App.Map.p2.css( "background-size", "cover" );
		App.Map.p2.css( "background-position-x", "center" );
		App.Map.p2.css( "background-repeat", "no-repeat" );
	},

	loadnextpage: function (target)
	{
		console.log( "called loadnextpage with " + target );
		$.ajax(
			cp.server.ajaxurl, {
				type   : 'post',
				data   : {
					action: 'lazyload',
					target: target
				},
				success: function (result) {
					var data = JSON.parse( result );
					if (!data.error) {
						App.Map.UI.shuttle( data );
					}
				},
				error  : function (info) {
					// App.Map.UI.handlegoback();
				}
			} );
	},

	shuttle: function (data)
	{
		App.Map.UI.Builder.show[ data.displaytype ]( data );
		App.Map.UI.Builder.setup[ data.displaytype ]( App.Map.UI.Builder.hide[ data.displaytype ] );
	},
	// animation and hooking of page listening events post-intro
	wakeup : function (childnodes)
	{
		App.Map.gettexts().data( childnodes.data() ).enter()
			.append( "svg:text" )
			.classed( "nodetext", true )
			.attr( "id", function (d) {
				return d.childDetail.tident;
			} )
			.attr( "fill-opacity", 1 )
			.text( function (d) {
				return d.childDetail.text;
			} )
			.on( "mouseover", App.Map.UI.makehighlight )
			.on( "mouseout", App.Map.UI.mouseunhighlight )
			.on( "click", App.Map.UI.expand )
			.call( App.Map.force.drag );

		this.ready = true;
		App.Map.force.alpha( App.Map.force.alpha() * 1.5 );

		var done = 0;
		childnodes.each( function (d) {
			TweenLite.to(
				d.childDetail,
				1, {
					ease            : Back.easeOut.config( 4 ),
					r               : App.Map.childradius * 4,
					onStart         : App.Map.UI.d3init,
					onStartParams   : [ d, "#" + d.ident, "{self}" ],
					onComplete      : function () {
						done++;
						if (done === 5)
						{
							App.Map.gettexts().each( function (d) {
								if (cp.nullundef( d.childDetail )) {
									d.childDetail = { textopacity: 0 };
								}

								d.childDetail.textopacity = 1;
								TweenLite.to( d.childDetail, 0.5, {
									ease          : Power3.easeIn,
									textopacity   : 0,
									onUpdate      : App.Map.UI.d3caller,
									onUpdateParams: [
										d,
										"fill-opacity",
										"#" + d.childDetail.tident,
										function () {
											return d.childDetail.textopacity;
										} ]
								} );

								TweenLite.to( d.childDetail, 1.5, {
									ease            : Power1.easeOut,
									r               : App.Map.childradius,
									onStart         : App.Map.UI.d3init,
									onStartParams   : [ d, "#" + d.ident, "{self}" ],
									onComplete      : App.Map.UI.allowmousemove,
									onCompleteParams: [ d, "#" + d.ident ],
									onUpdate        : App.Map.UI.d3caller,
									onUpdateParams  : [
										d,
										"r",
										"#" + d.ident,
										function () {
											return d.childDetail.r;
										} ]
								} );
							} );

							return App.Map.UI.d3teardown;
						}
					},
					onCompleteParams: [ d, "#" + d.ident ],
					onUpdate        : App.Map.UI.d3caller,
					onUpdateParams  : [
						d,
						"r",
						"#" + d.ident,
						function () {
							return d.childDetail.r;
						}
					]
				}
			);
		} );
	},
};