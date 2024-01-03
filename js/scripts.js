/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
//

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

window.open(page,“popup2”,“width=500, height=200”);

function window.external.ShowPopup(Name, URL, Width, Height, Top, Left, Param);

    procedure ShowPopup(const Name, URL: String; Width, Height,
     Top, Left: Integer; IsModal, RedirectLinksToMain: Boolean);

    procedure ShowFirstPopup;
  begin
   ShowPopup("mypopup", "popup1.htm", 400, 300, 50, 25, false, false);
  end;

    { NewWindow: opens a new popup window. URL : url to the page to display.
WindowName: name of the popup (for targets and other functions).
width: width of the popup height: height of the popup top:
y screen position of the popup left: x screen position of the popup.
redirect: if "1", then all links are redirected to the main window. }

procedure NewWindow(Url, WindowName, Width, Height, Top, Left, Redirect: String);
begin
ShowPopup(WindowName, Url, StrToInt(width), StrToInt(height),
StrToInt(top),StrToInt(left), false, Redirect = "1");
end;




    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
