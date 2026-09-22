(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$(".toggle-password").click(function() {

	  $(this).toggleClass("fa-eye fa-eye-slash");
	  var input = $($(this).attr("toggle"));
	  if (input.attr("type") == "password") {
	    input.attr("type", "text");
	  } else {
	    input.attr("type", "password");
	  }
	});

})(jQuery);

document.addEventListener("DOMContentLoaded", () => {
    window.electronAPI.getConsultants().then((result) => {
        if (!result.success) {
            console.log(result.error);
            return;
        }

        const consultantSelect = document.querySelector("#consultant");

        result.consultants.forEach((consultant) => {
            const option = document.createElement("option");

            option.value = consultant.id;
            option.textContent = consultant.name;

            consultantSelect.appendChild(option);
        });
    });
});