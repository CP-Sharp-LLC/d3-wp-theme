$(document).on("keyup", function(){
	App.Map.p2.css('background-image', $('#image').val());
	App.Map.p2.css('background-position', $('#position').val());
	App.Map.p2.css('background-repeat', $('#repeat').val());
	App.Map.p2.css('background-color',$('#color').val());
	App.Map.p2.css('background-size',$('#size').val());
});
