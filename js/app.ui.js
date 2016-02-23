/* globals d3, cp, App, TweenLite, Power1, Power2, Power3, Back, cpd3uiserverside */

App.Map.UI = {
	ready: false,
	mmallowed: false,
	makehighlight: function(d, i)
	{
		if(!App.Map.UI.ready || !App.Map.UI.mmallowed ){ return;}
		var color = d.childDetail.color;

		TweenLite.to(App.body, 0.3, { ease: Power1.easeOut, "background-color": d.childDetail.color.dark(6).toString()});
		TweenLite.to(d.childDetail, 0.3,{ease: Back.easeOut.config(4),r: App.Map.childradius * 3.5,
			onStart: App.Map.UI.d3init,
			onStartParams: [d, "#" + d.ident, "{self}"],
			onComplete: App.Map.UI.d3teardown,
			onCompleteParams: [d, "#" + d.ident],
			onUpdate: App.Map.UI.d3caller,
			onUpdateParams: [d, "r", "#" + d.ident, function() {return d.childDetail.r; }]
		});

		TweenLite.to(d.childDetail, 0.3, {
			ease: Power3.easeOut,
			textopacity:1,
			onUpdate: App.Map.UI.d3caller,
			onUpdateParams: [
				d,
				"fill-opacity",
				"#" + d.childDetail.tident,
				function() { return d.childDetail.textopacity; }]
		});
	},

	unhighlight: function(d, target)
	{
		if(d.childDetail.selected || !App.Map.UI.ready || !App.Map.UI.mmallowed ) {
			return;
		}

		TweenLite.to(App.body, 0.3, { ease: Power1.easeIn, "background-color": App.Map.logocolors.black.a(255).toString()});

		TweenLite.to(d.childDetail, 0.3, {ease: Back.easeIn.config(4), r: App.Map.childradius,
			onStart: App.Map.UI.d3init,
			onStartParams: [d, "#" + d.ident, "{self}"],
			onComplete: App.Map.UI.d3teardown,
			onCompleteParams: [d, "#" + d.ident],
			onUpdate: App.Map.UI.d3caller,
			onUpdateParams: [d, "r", "#" + d.ident, function() {return d.childDetail.r; }]
		});

		TweenLite.to(d.childDetail, 0.3, {ease: Power3.easeIn, textopacity:0,
			onUpdate:App.Map.UI.d3caller,
			onUpdateParams: [d, "fill-opacity", "#" + d.childDetail.tident,  function() {return d.childDetail.textopacity; }]});
	},

	expand: function(d, i){
		var target = d3.select(this);
		var currentlySelected = d.childDetail.selected;
		App.Map.UI.deselect();
		d3.event.stopPropagation();
		if(currentlySelected) {
			return;
		}

		d.childDetail.selected = true;
		App.Map.selectedparent = d;

		var gcnodes = d3.range(0, d.childDetail.children.items.length).map(App.Map.Data.gc.map);
		var gcs = App.Map.getgrandchildren().data(gcnodes);
		gcs.enter().append("circle")
			.attr("class", "grandchildnode")
			.attr("r", function(g, i){return App.Map.childradius*3;})
			.attr("fill", function(g, i){return "gray";})
			.attr("cx", function(g, i){return App.Map.selectedparent.x;})
			.attr("cy", function(g, i){return App.Map.selectedparent.y;})
			.attr("fill-opacity", 0)
			.on("click", App.Map.UI.nextpage)
			.call(App.Map.force.drag);

		gcs.exit().remove();

		var grandchildren = App.Map.getgrandchildren();
		var gctext = App.Map.getgctext().data(gcnodes);
			gctext.enter()
			.append("svg:text")
			.classed("gctext", true)
			.attr("id", function(d) { return d.gcdetail.tident; })
			.attr("fill-opacity", 1)
			.text(function(d) { return d.gcdetail.text;})
			.on("click", App.Map.UI.nextpage)
			.call(App.Map.UI.initdrag);

		gctext.exit().remove();

		grandchildren
			.attr("fill", function(g, i){return d.childDetail.color;})
			.attr("fill-opacity", 1);

		gcnodes.slice().forEach(function(target, i)
		{
			App.Map.gccount++;
			App.Map.nodes.push(gcnodes[i]);
			App.Map.links.push({ source: d, target: gcnodes[i], grandchild: true });
		});

		App.Map.force.nodes(App.Map.nodes);
		App.Map.force.links(App.Map.links);

		App.Map.drawlines();

		App.Map.force.start();
	},

	destroygc: function()
	{
		var grandchildren = App.Map.getgrandchildren();

		grandchildren
			.classed("grandchildnode", false)
			.attr("fill", function(g, i){return "gray";})
			.attr("cx", function(g, i){return App.Map.selectedparent.x;})
			.attr("cy", function(g, i){return App.Map.selectedparent.y;})
			.attr("fill-opacity", 0);

		while(App.Map.gccount !== 0)
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

	deselect: function()
	{
		App.childnodes.filter(function(n) {return n.selected;})
			.forEach(function(m)
			{
				m.selected = false;
				var element = d3.select("#v" + m.vertex);
				var data = element.data();
				App.Map.UI.unhighlight(data[0], element[0][0]);
			});

		App.Map.UI.destroygc();

		App.Map.UI.refresh();
	},

	refresh: function()
	{
		if(!this.ready) {
			return;
		}

		App.Map.gettexts()
			.attr("x", function(d) {
				return d.x - this.clientWidth/2;
				})
			.attr("y", function(d) {return d.y + 5;});
	},

	handleclick: function(d, i)
	{
		if (d3.event.defaultPrevented) {
			return;
		}

		App.Map.UI.deselect();
	},

	wakeup: function(childnodes){
		App.Map.gettexts().data(childnodes.data()).enter()
			.append("svg:text")
			.classed("nodetext", true)
			.attr("id", function(d) { return d.childDetail.tident; })
			.attr("fill-opacity", 1)
			.text(function(d) { return d.childDetail.text;})
			.on("mouseover", App.Map.UI.makehighlight)
			.on("mouseout", App.Map.UI.mouseunhighlight)
			.on("click", App.Map.UI.expand)
			.call(App.Map.force.drag);

		this.ready = true;
		App.Map.force.alpha(App.Map.force.alpha()*1.5);

		var done = 0;
		childnodes.each(function(d){
			TweenLite.to(
				d.childDetail,
				1, {
					ease: Back.easeOut.config(4),
					r: App.Map.childradius * 4,
					onStart: App.Map.UI.d3init,
					onStartParams: [d, "#" + d.ident, "{self}"],
					onComplete: function() {
						done++;
						if(done === 5)
						{
							App.Map.gettexts().each(function(d){
								d.childDetail.textopacity = 1;
								TweenLite.to(d.childDetail, 0.5, {
									ease: Power3.easeIn,
									textopacity:0,
									onUpdate: App.Map.UI.d3caller,
									onUpdateParams: [
										d,
										"fill-opacity",
										"#" + d.childDetail.tident,
										function() { return d.childDetail.textopacity; }]
								});

								TweenLite.to(d.childDetail, 1.5,{
									ease: Power1.easeOut,
									r: App.Map.childradius,
									onStart: App.Map.UI.d3init,
									onStartParams: [d, "#" + d.ident, "{self}"],
									onComplete: App.Map.UI.allowmousemove,
									onCompleteParams: [d, "#" + d.ident],
									onUpdate: App.Map.UI.d3caller,
									onUpdateParams: [
										d,
										"r",
										"#" + d.ident,
										function() { return d.childDetail.r; }]
								});
							});

							return App.Map.UI.d3teardown;
						}
					},
					onCompleteParams: [d, "#" + d.ident],
					onUpdate: App.Map.UI.d3caller,
					onUpdateParams: [
						d,
						"r",
						"#" + d.ident,
						function() {
							return d.childDetail.r;
						}
					]
				}
			);
		});
	},

	allowmousemove: function(d, c)
	{
		App.Map.UI.mmallowed = true;
		return App.Map.UI.d3teardown;
	},

	d3init: function(d, target, tweenInstance)
	{
		if(d.childDetail.tween.has(target))
		{
			d.childDetail.tween.get(target).kill();
		}

		d.childDetail.tween.set(target, tweenInstance);
	},

	d3teardown: function(d, target)
	{
		if(d.childDetail.tween.has(target))
		{
			d.childDetail.tween.remove(target);
		}
	},

	d3caller: function(d, attr, target, tvalue)
	{
		d3.select(target).attr(attr, tvalue());
	},

	mouseunhighlight: function(d, i)
	{
		var target = d3.select(this);
		App.Map.UI.unhighlight(d, target);
	},

	initdrag: function(s, i) {
		App.Map.force.drag();
	},

	nextpage: function(d)
	{
		d3.event.stopPropagation();
		App.Map.UI.loadnextpage(d.gcdetail.target, App.Map.UI.shownextpage);

	},

	shownextpage: function(overridecolor) {
		var backcolor = overridecolor === null ? App.Map.selectedparent.childDetail.color.a(0.4).toString() : overridecolor;

		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		App.Map.p2.height($(window).height());
		App.Map.p2.css('maxheight', windowHeight);
		App.Map.p2.width($(window).width());
		App.Map.p2.css('maxheight', windowWidth);

		TweenLite.to(App.Map.svg, 1, {ease: Power3.easeOut, opacity: 0});
		TweenLite.to(App.body, 1, { ease: Power3.easeOut, "background-color": backcolor});
		TweenLite.to(cp, 1,
			{ease: Power3.easeIn,scroll:App.Map.p2.offset().top,
				onComplete: App.Map.UI.handlegoback,
				onUpdate: cp.updatescroll,
				onUpdateParams: [function() { return cp.scroll; }]});
	},

	setp2bg: function(imageurl) {
		App.Map.p2.css("background-image", "url(" + imageurl + ")");
		App.Map.p2.css("background-size", "cover");
		App.Map.p2.css("background-position-x", "center");
		App.Map.p2.css("background-repeat", "no-repeat");
	},

	loadnextpage: function(target, callback)
	{
		$.ajax(
			// this.gcdetail.target,
			cpd3uiserverside.ajaxurl,
			{
				type: 'post',
				data: {
					action: 'lazyload',
					target: target
				},
				success: function(result){
					App.Map.p2.children('#page2content').html(result);
				}
			});
		callback();
	},

	handlegoback: function()
	{
		d3.select("body")
			.on("keyup", function()
			{
				if(d3.event.keyCode === cp.keycode.esc)
				{
					App.Map.UI.firstpage();
				}
			});
	},

	firstpage: function()
	{
		d3.event.stopPropagation();
		TweenLite.to(cp, 1, {ease: Power3.easeOut,scroll:0, onComplete: function(){App.Map.p2.height(0);}, onUpdate: cp.updatescroll,
		onUpdateParams: [function() { return cp.scroll; }]});
		TweenLite.to(App.Map.svg, 1, {ease: Power2.easeIn, opacity: 1});
		TweenLite.to(App.body, 1, { ease: Power3.easeIn, "background-color": App.Map.selectedparent.childDetail.color.dark(6).toString()});
		App.Map.force.start();
	}
};