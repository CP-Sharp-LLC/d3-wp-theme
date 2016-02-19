App.Map = {
	// static properties
	chargeMultiplier: .0006,
	radius: 0,
	vertexcount: 50,
	steps: [10],
	animationSpeed: 1,
	vertexradius: 5,
	childradius: 15,
	p2: $("#page2"),
	// dynamics
	height: 0,	width: 0,	interval: null,	svg: [], mainNode: null, force: null,
	links: [],	nodes: [],	currentstep: null,	currentvertex: 0, currentvertexoffset: 1,
	charge: 0, selectedparent: null,

	centerofgravity: {fixed: true, x: 0, y: 0}, gccount: 0,

	logocolors: {
		bluering: new Logocolor({r:22, g:136, b:155 }),		// ring 1 blue
		greenring: new Logocolor({r:53, g:162, b:67 }),			// ring 2 green
		purplering: new Logocolor({r:158, g:25, b:127 }),		// ring 3 purple
		redring: new Logocolor({r:255, g:96, b:0 }),			// ring 4 red
		orangering: new Logocolor({r:255, g:175, b:0}),		// ring 5 orange
		lightlink: new Logocolor({r:205,g:205,b:205}),
		darklink: new Logocolor({r:66,g:66,b:6}),
		black: new Logocolor({r:0, g: 0, b:0})
	},

	currentlinkcolor: null,

	init: function() {
		this.resetlayout();
		this.radius = this.height * .5;
		this.charge = this.width * this.height * this.chargeMultiplier;

		this.currentlinkcolor = this.logocolors.lightlink.a(0.5);

		this.force = d3.layout.force()
			.charge(function(d, i)
				{
					if(i == 0) return 0;
					if(typeof d.childDetail != "undefined")
						if(d.childDetail.selected) return - App.Map.charge * 150;
					if(d.grandchild) return - App.Map.charge * 4;
					return - App.Map.charge;
				})
			.linkDistance(function(d, i){
				if(i == 0) return 40;
				if(d.grandchild) return App.Map.childradius * 10;
				return 20;
			})
			.friction(.55)
			.size([this.width, this.height])
			.gravity(.12);

		this.force.on("tick", this.tick);
		this.force.on("end", this.jiggle);
	},

	draw: function()
	{
		clearInterval(this.interval);

		this.centerofgravity.x = this.width/2;
		this.centerofgravity.y = this.height/2;

      	this.nodes = [this.centerofgravity];

      	// arrange nodes in a circle
      	this.nodes = this.nodes
      		.concat(d3.range(1, this.vertexcount + 1))
      		.map(App.Map.Data.nodemap);

		this.links = [];

		this.currentvertex = 0;
		this.currentvertexoffset = 0;

		this.force.nodes(this.nodes);

	    this.nodes.slice(1).forEach(App.Map.Data.nodeslice);
	    this.getvertices().style("fill", "white");

	    this.drawcircles();
	    this.drawlines();
	    this.interval = setTimeout(App.Map.Animate.go, this.animationSpeed);
	},

	drawcircles: function()
	{
	    var nodeArray = this.nodes.slice(1).sort(function (a, b) {
	          if(a.isChild && ! b.isChild)
	          {
	          	return 1;
	          }
	          if(!a.isChild && b.isChild)
	          {
	          	return -1;
	          }

	        return 0;
	      });

		var circles = this.getcircles().data(nodeArray);
		circles.enter().append("svg:circle");
		circles.attr("r", function(d, i) {
			if(i == 0) return 0;
			return App.Map.vertexradius;
			})
			.attr("class",
				function(d, i)
				{
					if(d.grandchild) return 'grandchildnode';
					if(d.isChild) return 'vertex childnode threedee';
					return i == 0 ? 'magic-vertex nonchildnode threedee' : 'vertex nonchildnode threedee';
				})
			.attr("id", function(d) { return d.ident;})
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; })
			.attr("vertexindex", function(d, i) { return i; });
		circles.call(App.Map.force.drag);
		circles.exit().remove();
	},

	drawlines: function(){
		var lines = this.getlines().data(this.links);
		var circles = this.getcircles();
		lines.enter().insert("svg:line", circles[0].length > 0 ? 'circle' : null);
		lines.attr("class", "link")
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.attr("stroke", App.Map.currentlinkcolor.toString());
		lines.exit().remove();
	},

	resetlayout: function() {
		this.resize($(window).height(), $(window).width());
	},

	resize: function(height, width) {
		this.height = height;
		this.width = width;
	},

	getvertices: function() { return this.svg.selectAll(".vertex"); },

	getcircles: function()	{ return this.svg.selectAll("circle");},

	getchildnodes: function() {return this.svg.selectAll(".childnode");},

	getgrandchildren: function() {return this.svg.selectAll(".grandchildnode");},

	getgctext: function() {return this.svg.selectAll(".gctext");},

	getlines: function() {return this.svg.selectAll("line.link"); },

	gettexts: function() {return this.svg.selectAll('text'); },

	tick: function(e)
	{
        App.Map.getcircles()
        	.attr("cx", function(d) { return d.x; })
        	.attr("cy", function(d) { return d.y; });

        App.Map.getlines()
    		.attr("x1", function(d) { return d.source.x; })
    	    .attr("y1", function(d) { return d.source.y; })
        	.attr("x2", function(d) { return d.target.x; })
        	.attr("y2", function(d) { return d.target.y; });

		App.Map.UI.refresh();
	},

	jiggle: function(e)
	{
		if(App.debug) return;
		if(e.alpha < .01)
		{
			// App.Map.UI.refresh();
			// App.Map.force.alpha(.01);
		}
	}
};

cp.addinit(App.Map, App.Map.init);

App.Map.Data = {
	nodeslice: function(target, i)
	{
	      App.Map.links.push({source: App.Map.nodes[i == App.Map.nodes.length - 2 ? 1 : i+2], target: target});
	},

	nodemap: function(d, i)
	{
		if(i == 0) return d;

		var xloc = App.Map.width/2+App.Map.radius*Math.cos((i*2*Math.PI/App.Map.vertexcount) - Math.PI/2);
		var yloc = App.Map.width/2+App.Map.radius*Math.sin((i*2*Math.PI/App.Map.vertexcount) - Math.PI/2);

		for (var j=0; j < App.childnodes.length; j++) {
			if(App.childnodes[j].vertex == i){
				return {
					x:			xloc,
					y:			yloc,
					isChild:	true,
					childDetail: App.childnodes[j],
					ident: "v" + i
				};
			}
		};

		return {
			x:			xloc,
			y:			yloc,
			isChild:	false,
			ident: "v" + i
        };
	},

	gc: {
		calcx: function(d, i, distance, theta)
		{
			distance = cp.nullundef(distance) ? App.Map.Data.gc.calcd() : distance;
			theta = cp.nullundef(theta) ? App.Map.Data.gc.calctheta(i) : theta;

			var x= App.Map.selectedparent.x + (distance * Math.cos(theta));
			return x;
		},

		calcy: function (d, i, distance, theta)
		{
			distance = cp.nullundef(distance) ? App.Map.Data.gc.calcd() : distance;
			theta = cp.nullundef(theta) ? App.Map.Data.gc.calctheta(i) : theta;

			var y= App.Map.selectedparent.y + (distance * Math.sin(theta));
			return y;
		},

		calcd: function()
		{
			return App.Map.childradius * 10;
		},

		calctheta: function(i)
		{
			var children = App.Map.selectedparent.childDetail.children;
			return App.angles[children.branchDirection](i, children.items.length) * (3.14 / 180);
		},

		map: function(d, i)
		{

			var parent = App.Map.selectedparent;
			var distance = App.Map.Data.gc.calcd();

			var explodeArea= "top";
			if(App.Map.height - parent.y < App.Map.height / 2)
			{
				explodeArea = "bottom";

			}

			if(App.Map.width - parent.x < App.Map.width / 2)
			{
				explodeArea += "left";
			}
			else
			{
				explodeArea += "right";
			}

			var theta = cp.angles[explodeArea](i, parent.childDetail.children.items.length) + i * 3;

			var xloc = App.Map.Data.gc.calcx(d, i, 10, theta);
			var yloc = App.Map.Data.gc.calcy(d, i, 10, theta);

			return {
				x: xloc,
				y: yloc,
				grandchild: true,
				gcdetail: parent.childDetail.children.items[i],
				ident: "vgc" + i
			};
		}
	}
};

App.Map.Animate = {
	go: function() {
		var stepInstruction = App.Map.steps[App.Map.currentvertex % App.Map.steps.length];

		App.Map.currentstep = (App.Map.currentvertex + App.Map.currentvertexoffset) - App.Map.vertexcount * Math.floor((App.Map.currentvertex + App.Map.currentvertexoffset) / App.Map.vertexcount);

		var circles = App.Map.getcircles();

		if(App.Map.currentvertexoffset == 0)
		{
			// hits after each bind
			App.Map.Animate.mainAnimation(circles, stepInstruction);
	  	}
	  	else if(App.Map.currentvertexoffset != stepInstruction)
	  	{
	  		// every.single.cycle
	  		App.Map.Animate.stepAnimation(circles, stepInstruction);
		}
		else
		{
			// hits to create a bind
		    App.Map.Animate.bindNodeAnimation(circles);
		}

		if(App.Map.currentvertex < App.Map.vertexcount){
	    	App.Map.interval = setTimeout(App.Map.Animate.go, App.Map.animationSpeed);
		}
		else
		{
			App.Map.Animate.finalize(circles);
		}
	},

	mainAnimation: function(circles, stepInstruction)
	{
			// this circle
			circles.filter(
				function(d,i)
				{
					// sets current vertex color during animation
					return App.Map.currentvertex == i;
				}).style("fill", App.Map.logocolors.bluering);

			// past circles
			circles.filter(
				function(d,i) {
					return App.Map.currentvertex > i;
				}).style("fill","gray");

			// future circles
			circles.filter(
				function(d,i)
				{
					return App.Map.currentvertex < i ;
				}).style("fill","#CCC");

			App.Map.currentvertexoffset = App.Map.currentvertexoffset + (stepInstruction > 0 ? 1 : -1);
	},

	stepAnimation: function(circles, stepInstruction)
	{
		// circles as they approach a binding
    	circles.filter(
	    		function(d,i)
	    		{
	    			return App.Map.currentstep == i;
    			}).style("fill", App.Map.logocolors.redring);

    	App.Map.currentvertexoffset = App.Map.currentvertexoffset + (stepInstruction > 0 ? 1 : -1);
	},

	bindNodeAnimation: function(circles)
	{

		    App.Map.links.push({
		    	source: App.Map.nodes.slice(1)[App.Map.currentvertex],
		    	target: App.Map.nodes.slice(1)[App.Map.currentstep]
	    	});

		    App.Map.drawlines();
		    App.Map.currentvertex++;

  			App.Map.force.links(App.Map.links);
			App.Map.force.start();

		    if(App.debug) return;
		    App.Map.currentvertexoffset = 0;
	},

	finalize: function(circles)
	{
		// final fill at end of proc
	    	App.Map.interval = null;
	    	App.Map.getvertices().filter(function(d,i) { return !d.isChild;}).style("fill", "gray");

	    	var childverts = App.Map.getvertices().filter(function(d,i) { return d.isChild;});

	    	childverts
				.classed("childnode", true)
				.on("mouseover", App.Map.UI.makehighlight)
				.on("mouseout", App.Map.UI.unhighlight)
				.on("click", App.Map.UI.expand)
    			.style("fill", function(d) {return d.childDetail.color;});

			App.Map.svg.on("click", App.Map.UI.handleclick);

  			App.Map.force.start();

    		App.Map.UI.wakeup(childverts);
	}
};

