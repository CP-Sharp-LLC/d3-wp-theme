/* globals cp, App, d3, cpd3coreserverside */

function Logocolor(attributes) {
	var lc = this;
	$.map(attributes, function (property, key) {
		lc[key] = property;
	});

	cp.addready(App, function () {
		$(window).resize(function () {
			App.Map.resetlayout();
		});
	});
}

Logocolor.prototype = {
	r: 0,
	g: 0,
	b: 0,
	a: function (alpha) {
		return "rgba(" + this.r + "," + this.g + "," + this.b + "," + alpha + ")";
	},

	dark: function (depth) {
		return "rgba(" + this.r / depth + "," + this.g / depth + "," + this.b / depth + ",1)";
	},

	toString: function () {
		return this.a(1);
	}
};


function ChildNode(attributes) {
	var cnode = this;
	$.map(attributes, function(property, key) { cnode[key] = property; });
	cp.addready(cnode, function() { cnode.r = App.Map.childradius; });
}

ChildNode.prototype =
{
	tident: "",
	ident: "",
	text: "",
	color: "",
	vertex: 0,
	image: "",
	tween: d3.map(),
	r: 0,
	textopacity: 0,
	grandchild: false,
	selected: false
};

function GlobalManager()
{
	this.keycode = {esc: 27};

	this.angles = {
		"top": function(index, qty) {
			var anglearea = 180; // half circle
			var angleoffset = 180;	// beginning left-middle
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			} ,// 180->360
		"right": function(index, qty) {
			var anglearea = 180; // half circle
			var angleoffset = 0-90;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			 } , // -90->90
		"topright": function(index, qty) {
			var anglearea = 90;
			var angleoffset = 0;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			 } , // -90->90
		"bottom": function(index, qty) {
			var anglearea = 180; // half circle
			var angleoffset = 0;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			} , // 0->180
		"bottomright": function(index, qty) {
			var anglearea = 90; // half circle
			var angleoffset = 90;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			} , // 0->180
		"topleft": function(index, qty) {
			var anglearea = 90; // half circle
			var angleoffset = 180;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			} , // 180-270
		"bottomleft": function(index, qty) {
			var anglearea = 90; // half circle
			var angleoffset = 90;	// beginning
			return this.calcniceoffset(index, qty, anglearea, angleoffset );
			},  // 90-180
		calcniceoffset: function(index, qty, anglearea, angleoffset )
		{
			var veralloc = (anglearea/qty);	// space allowed based on number of reqs vs qty
			var minoffset = veralloc*index; // minimal starting position
			var niceoffset = minoffset + (veralloc/2); // the middle ground
			return niceoffset+angleoffset;
		}
	};

	this.socialmedia =
	[
		{image: "/wp-content/uploads/2015/09/fb-e1442211516344.png", alt: "CP Sharp's facebook page", link: "https://www.facebook.com/cpsharpllc"},
		{image: "/wp-content/uploads/2015/09/gplus-e1442211509381.png", alt: "CP Sharp's Google+ page", link: "https://www.google.com/+CpsharpNet"},
		{image: "/wp-content/uploads/2015/09/linkedin-e1442211454767.png", alt: "CP Sharp's LinkedIn page", link: "https://www.linkedin.com/company/cp-sharp-llc"},
		{image: "/wp-content/uploads/2015/09/twitter-e1442211491176.png", alt: "CP Sharp's Twitter page", link: "https://twitter.com/cpsharpllc"}
	];

	this.newcreate = function(){
		var nodes = [];
		var jsNodes = JSON.parse(cpd3coreserverside.childnodes);
		for(var i = 0; i < jsNodes.length; i++)
		{
			jsNodes[i].color = eval(jsNodes[i].color);
			nodes.push(new ChildNode(jsNodes[i]));
		}

		return nodes;
	};

	this.createchildnodes = function(){
		return this.newcreate();
		return [new ChildNode(
				{tident:"about", text:"about us", color: App.Map.logocolors.bluering, vertex: 2, image: "",
					children: {branchDirection: "right",
					items:
					[
						{tident: "team", text:"our team", target:"sideload.php?id=1"},
						{tident: "clients", text:"our clients",target:"sideload.php?id=1"},
						{tident: "founder", text:"founder",target:"sideload.php?id=1"},
						{tident: "vision", text:"something",target:"sideload.php?id=1"},
						{tident: "smth3", text:"vision",target:"sideload.php?id=1"},
					]}
				}),
			new ChildNode({tident:"tech", text:"tech", color: App.Map.logocolors.greenring, vertex: 34, image: "",
				children: {branchDirection: "bottom",
					items:
					[
						{tident: "blog", text:"blog"},
					]}}),
			new ChildNode({tident:"service", text:"services", color: App.Map.logocolors.purplering, vertex: 18, image: "",
				children: {branchDirection: "topleft",
					items:
					[
						{tident: "mobile", text:"mobile apps"},
						{tident: "web", text:"web design"},
					]}}),
			new ChildNode({tident:"contact", text:"contact", color: App.Map.logocolors.redring, vertex: 26, image: "",
				children: {branchDirection: "bottomleft",
					items:
					[
						{tident: "email", text:"email"},
					]}}),
			new ChildNode({tident:"portfolio", text:"folio", color: App.Map.logocolors.orangering, vertex: 50, image: "",
				children: {branchDirection: "top",
					items:
					[
						{tident: "webportfolio", text:"web design"},
					]}})
			];
	};

	this.initqueue = [];
	this.readyqueue = [];
	this.primarycontainer = "main";
	this.scroll = 0;

	this.updatescroll = function(newValue)
	{
		window.scrollTo(0,newValue());
	};

	this.addready = function(theobject, readymethod)
	{
		this.readyqueue.push({caller: theobject, method: readymethod});
	};

	this.addinit = function(theobject, initmethod)
	{
		this.initqueue.push({caller: theobject, method: initmethod});
	};

	this.processreadyqueue = function()
	{
		this.initqueue.forEach(function(initmethod)
		{
			initmethod.method.call(initmethod.caller);
		});

		App.ready();

		this.readyqueue.forEach(function(readymethod)
		{
			readymethod.method.call(readymethod.caller);
		});
	};


	this.nullundef = function(somevar){
		if(somevar === null) {
			return true;
		}

		if(typeof somevar === "undefined") {
			return true;
		}

		return false;
	};
}
