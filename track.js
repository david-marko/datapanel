function getDeviceInfo() {
    let ua = navigator.userAgent;
    let browser = '';
    let os = '';
    let device = '';

    if (/Firefox[\/\s](\d+\.\d+)/.test(ua)) {
        browser = 'Firefox';
    } else if (/Chrome[\/\s](\d+\.\d+)/.test(ua)) {
        browser = 'Chrome';
    } else if (/Edge[\/\s](\d+\.\d+)/.test(ua)) {
        browser = 'Edge';
    } else if (/Safari[\/\s](\d+\.\d+)/.test(ua)) {
        browser = 'Safari';
    } else if (/Opera[\/\s](\d+\.\d+)/.test(ua)) {
        browser = 'Opera';
    } else {
        browser = 'Unknown';
    }

    if (/Windows NT (\d+\.\d+)/.test(ua)) {
        os = 'Windows';
        device = 'PC';
    } else if (/Mac OS X (\d+[_.]\d+[_.]\d+)/.test(ua)) {
        os = 'Mac OS X';
        device = 'Mac';
    } else if (/Android (\d+\.\d+)/.test(ua)) {
        os = 'Android';
        device = 'Android Phone';
    } else if (/iPhone OS (\d+[_.]\d+)/.test(ua)) {
        os = 'iOS';
        device = 'iPhone';
    } else if (/iPad.*OS (\d+[_.]\d+)/.test(ua)) {
        os = 'iOS';
        device = 'iPad';
    } else {
        os = 'Unknown';
        device = 'Unknown';
    }

    return {
        browser,
        os,
        device
    };
}

function getPageInfo() {
    let url = window.location.href;
    let referrer = document.referrer;
    return {
        url,
        referrer
    };
}

// Anonymous "self-invoking" function
(function () {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    // Poll for jQuery to come into existance
    var checkReady = function (callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function () { checkReady(callback); }, 20);
        }
    };

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }
    function checkCookie() {
        let user_id = getCookie("user_id");
        if (user_id != "") {
            // alert("Welcome again " + user_id);

        } else {
            user_id = Math.floor(Math.random() * 1000000);;
            setCookie("user_id", user_id, 365);
        }
        return user_id;
    }
    // Start polling...
    checkReady(function ($) {
        $(function () {
            var getInfo = getDeviceInfo();
            var pageInfo = getPageInfo();
            var countryCode = ''; //'';
            // var city = '';
            $.get('http://ip-api.com/json/?fields=status,message,countryCode', function (response) {
                countryCode = response.countryCode;
                var data = {
                    user_id: checkCookie(), // Increase unique visitors count by 1
                    country: countryCode,
                    url: pageInfo.url,
                    referral: pageInfo.referrer,
                    browser: getInfo.browser,
                    os: getInfo.os,
                    device: getInfo.device // Use user agent string to determine device type
                };
                $.ajax({
                    url: 'http://127.0.0.1:5000/track',
                    type: 'POST',
                    data: JSON.stringify(data),
                    contentType: 'application/json'
                });
                // console.log(response);
                // city = response.city;
            });

            // var endingTime = new Date().getTime();
            // var tookTime = endingTime - startingTime;
            // window.alert("jQuery is loaded, after " + tookTime + " milliseconds!");
        });
    });
})();