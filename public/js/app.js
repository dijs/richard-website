var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-34039831-1"]);
_gaq.push(["_trackPageview"]);
var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
function alerter(type, title, message){
	$(".alert").removeClass("alert-error alert-success").addClass("alert-" + type);
    $(".alert b").html(title);
  	return $(".alert span").html(message).parent().show();
}
$(document).ready(function(){
	$("div,img[rel=tooltip]").tooltip({
		placement: "bottom"
	});
	Recaptcha.create(
		"6LdXid8SAAAAADi0JC9VGWzxbQzkvedyupiaxDXG", 
		$("#recaptcha")[0], {}
   	);
   	$("button.close").click(function(){
   		$(this).parent().hide();
   	});
    $(".send").click(function(){
    	if($(".name").val().trim().length == 0){
    		return alerter("error", "Oops...", "Name cannot be empty.");
    	}    	
		if($(".message").val().trim().length == 0){
			return alerter("error", "Oops...", "Message cannot be empty.");
    	}    	
		$.post(
    		"/contact",
    		{
    			"name": $(".name").val().trim(),
    			"message": $(".message").val().trim(),
    			"challenge": $("[name=recaptcha_challenge_field]").val(),
    			"response": $("[name=recaptcha_response_field]").val()
    		},
    		function(r){
    			if(r.success){
    				alerter("success", "Success!", "Your message has been sent.");
    			}else{
					alerter("error", "Oops...", "You have entered the wrong two words.");
					Recaptcha.reload();
       			}
    		},
    		"json"
    	);
	});
});