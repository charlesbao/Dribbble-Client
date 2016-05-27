LoadHelper = {
    show: function() {
        $('[data-render="load"]').addClass("active")
    },
    hide: function() {
        $('[data-render="load"]').removeClass("active")
    }
}, LockHelper = {
    isLocked: function() {
        return "true" == $("body").attr("data-lock")
    },
    lock: function() {
        $("body").attr("data-lock", "true")
    },
    unlock: function() {
        $("body").removeAttr("data-lock")
    }
}, PaginationHelper = {
    reset: function() {
        PaginationHelper.setPage(1), PaginationHelper.resetLast()
    },
    setPage: function(a) {
        $("body").attr("data-page", a)
    },
    increasePage: function() {
        PaginationHelper.setPage(PaginationHelper.getPage() + 1)
    },
    getPage: function() {
        return parseInt($("body").attr("data-page"))
    },
    isLast: function() {
        return "true" == $("body").attr("data-last")
    },
    setLast: function() {
        $("body").attr("data-last", "true")
    },
    resetLast: function() {
        $("body").removeAttr("data-last")
    }
}, PathHelper = {
    store: !0,
    list: null,
    init: function() {
        if (this.store) {
            var a = StorageHelper.get("path") || this.list[0];
            this.valid(a) || (a = this.list[0]), this.set(a)
        } else this.set(this.list[0])
    },
    valid: function(a) {
        return -1 != this.list.indexOf(a)
    },
    get: function() {
        return $("body").attr("data-path")
    },
    set: function(a) {
        $("body").attr("data-path", a), this.store && StorageHelper.set("path", a)
    }
}, TokenHelper = {
    clientId: "e5179307737598609566a21b26e1f8c3973015f3457ed8b668ab79d747164534",
    clientSecret: "17d2e544ec0240cc828d1639e9afb078112f84ea47d16194d804545d16188444",
    token: null,
    getToken: function() {
        return TokenHelper.token || (TokenHelper.token = StorageHelper.get("token")), TokenHelper.token ? TokenHelper.token : void 0
    },
    setToken: function(a) {
        TokenHelper.token = a, StorageHelper.set("token", a)
    },
    resetToken: function() {
        TokenHelper.token = null, StorageHelper.reset("token")
    },
    obtainToken: function(a) {
        var b = {
            interactive: !0,
            url: TokenHelper.oauthUrl()
        };
        chrome.identity.launchWebAuthFlow(b, function(b) {
            if (!chrome.runtime.lastError) {
                var c = UrlHelper.params(b);
                c.hasOwnProperty("access_token") ? (TokenHelper.setToken(c.access_token), a(!0)) : c.hasOwnProperty("code") ? TokenHelper.exchangeCodeForToken(c.code, a) : a(!1)
            }
        })
    },
    exchangeCodeForToken: function(a, b) {
        var c = new XMLHttpRequest;
        c.open("POST", TokenHelper.codeUrl(a)), c.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), c.setRequestHeader("Accept", "application/json"), c.onload = function() {
            if (200 === this.status) {
                var a = JSON.parse(this.responseText);
                a.hasOwnProperty("access_token") ? (TokenHelper.setToken(a.access_token), b(!0)) : b(!1)
            } else b(!1)
        }, c.send()
    },
    oauthUrl: function() {
        var a = chrome.identity.getRedirectURL("auth");
        return "https://dribbble.com/oauth/authorize?client_id=" + TokenHelper.clientId + "&reponse_type=token&access_type=online&redirect_uri=" + encodeURIComponent(a)
    },
    codeUrl: function(a) {
        var b = chrome.identity.getRedirectURL("auth");
        return "https://dribbble.com/oauth/token?client_id=" + TokenHelper.clientId + "&client_secret=" + TokenHelper.clientSecret + "&redirect_uri=" + b + "&code=" + a
    }
}, StorageHelper = {
    get: function(a) {
        var a = this.key(a),
            b = $.cookie(a),
            c = localStorage.getItem(a);
        return !b && c && $.cookie(a, c), !c && b && localStorage.setItem(a, b), b || c
    },
    set: function(a, b) {
        var a = this.key(a);
        $.cookie(a, b), localStorage.setItem(a, b)
    },
    reset: function(a) {
        var a = this.key(a);
        $.removeCookie(a), localStorage.removeItem(a)
    },
    key: function(a) {
        return "_dribbble_new_tab_" + a
    }
}, UrlHelper = {
    params: function(a) {
        var b, c = {},
            d = /[#?&]?([^=]+)=([^&]*)/g;
        for (a = a.split("+").join(" "), a = a.replace(/http.*?\?/, ""); b = d.exec(a);) c[decodeURIComponent(b[1])] = decodeURIComponent(b[2]);
        return c
    }
}, WindowHelper = {
    open: function(a, b) {
        var c = $.map({
            scrollbars: "no",
            location: "no",
            directories: "no",
            status: 0,
            menubar: "no",
            toolbar: "no",
            resizable: "no"
        }, function(a, b) {
            return b + "=" + a
        }).join(",");
        window.open(a, b, c)
    }
}, Link = {
    defaultWidth: 400,
    defaultHeight: 300,
    $el: function(a) {
        return $('[data-render="link"][data-id="' + a + '"]')
    },
    render: function(a) {
        var b = this.parse(a);
        this.exists(b.id) || (this._render(b), this._handleImageLoad(b), this.$el(b.id).find('[data-action="share"]').click(function(a) {
            a.preventDefault(), a.stopPropagation();
            var b = $(this).closest('[data-action="share"]');
            WindowHelper.open(b.data("url"))
        }))
    },
    parseCollection: function(a) {
        return a.data || a
    },
    parse: function(a) {
        return a = a.shot || a, {
            id: a.id || a.source.id,
            url: a.html_url || a.source.sourceUrl,
            imageUrl: this.parseImageUrl(a),
            twitterUrl: this.shareOnTwitter(a),
            width: this.width(),
            height: this.height()
        }
    },
    shareOnTwitter: function(a) {
        var b = "https://twitter.com/intent/tweet",
            c = "";
        a.user && a.user.links.twitter && (c = " by @" + a.user.links.twitter.replace("https://twitter.com/", ""));
        var d = {
            source: "webclient",
            via: "designerboard & dribbblenewtab.com",
            url: a.html_url || a.source.sourceUrl,
            text: a.title + c
        };
        return b + "?" + $.param(d)
    },
    parseImageUrl: function(a) {
        var b = a.images || a.image,
            c = b.hidpi || b.big,
            d = b.normal || b.normal;
        return !c || !/.*\.gif$/.test(d) && d ? d : c
    },
    columns: function() {
        return Math.ceil($(window).width() / this.defaultWidth)
    },
    rows: function() {
        return Math.ceil($(window).height() / this.height())
    },
    width: function() {
        return $(window).width() / this.columns()
    },
    height: function() {
        return this.defaultHeight / this.defaultWidth * this.width()
    },
    exists: function(a) {
        return this.$el(a).length
    },
    _render: function(a) {
        var b = $('[data-template="link"]').html(),
            c = Mustache.render(b, a);
        $('[data-render="content"]').append(c)
    },
    _handleImageLoad: function(a) {
        this.$el(a.id).find("img").load(function() {
            $(this).closest('[data-render="link"]').addClass("active")
        })
    }
}, URL = {
    popular: function(a) {
        return TokenHelper.getToken() ? "https://api.dribbble.com/v1/shots?per_page=20&page=" + a + "&access_token=" + TokenHelper.getToken() : "https://jp.charlesbao.com/dribbble?nav=popular&page=" + a
    },
    recent: function(a) {
        return TokenHelper.getToken() ? "https://api.dribbble.com/v1/shots?per_page=20&sort=recent&page=" + a + "&access_token=" + TokenHelper.getToken() : "https://jp.charlesbao.com/dribbble?nav=lastest&page=" + a
    },
    following: function(a) {
        return "https://api.dribbble.com/v1/user/following/shots?per_page=20&page=" + a + "&access_token=" + TokenHelper.getToken()
    },
    shots: function(a) {
        return "https://api.dribbble.com/v1/user/shots?per_page=20&page=" + a + "&access_token=" + TokenHelper.getToken()
    },
    likes: function(a) {
        return "https://api.dribbble.com/v1/user/likes?per_page=20&page=" + a + "&access_token=" + TokenHelper.getToken()
    }
}, ChromeViewController = {
    init: function() {
        this.bind()
    },
    bind: function() {
        $('[data-action="chrome"]').bind("click", function() {
            var a = "chrome://" + $(this).attr("data-path");
            chrome.tabs.getCurrent(function(b) {
                chrome.tabs.update(b.id, {
                    url: a
                })
            })
        })
    }
}, LinksViewController = {
    init: function() {
        this.resize(), this.bind(), this.show()
    },
    bind: function() {
        $(document).bind("scroll", this.next.bind(this)), $(window).bind("resize", this.resize.bind(this)), $(window).bind("resize", this.next.bind(this)), $('[data-action="show"]').bind("click", function() {
            var a = $(this).data("path");
            PathHelper.set(a), LinksViewController.show()
        }), $('[data-action="share"]').bind("click", function(a) {
            a.preventDefault(), a.stopPropagation();
            var b = $(this).data("url");
            WindowHelper.open(b)
        })
    },
    resize: function() {
        var a = Link.width(),
            b = Link.height();
        $('[data-render="link"]').css("width", a + "px"), $('[data-render="link"]').css("height", b + "px")
    },
    show: function() {
        var a = PathHelper.get(),
            b = TokenHelper.getToken();
        if (-1 != ["popular", "recent"].indexOf(a) || b) {
            var c = $('[data-action="show"][data-path="' + a + '"]');
            c.hasClass("active") || LockHelper.isLocked() || ($('[data-action="show"]').removeClass("active"), c.addClass("active"), this.reset(), this.get())
        } else TokenHelper.obtainToken(this.show.bind(this))
    },
    reset: function() {
        $('[data-render="link"]').remove(), PaginationHelper.reset()
    },
    next: function() {
        var a = $(window).scrollTop() + $(window).height(),
            b = Link.rows() * Link.height() * 2;
        $("body").outerHeight() - a < b && this.get()
    },
    get: function() {
        if (!LockHelper.isLocked() && !PaginationHelper.isLast()) {
            LockHelper.lock(), LoadHelper.show();
            var a = PathHelper.get();
            $.ajax({
                type: "GET",
                dataType: "json",
                url: URL[a](PaginationHelper.getPage()),
                processData: !1,
                success: function(b) {
                    if (a == PathHelper.get()) {
                        var c = Link.parseCollection(b);
                        LinksViewController.render(c)
                    }
                },
                error: function(a) {
                    429 == a.status && TokenHelper.resetToken(), LinksViewController.showErrorMessage(), PathHelper.set("popular"), LinksViewController.show()
                },
                complete: function() {
                    LockHelper.unlock(), LoadHelper.hide(), $('[data-render="link"]').length && LinksViewController.next()
                }
            })
        }
    },
    render: function(a) {
        for (var b = 0; b < a.length; b++) Link.render(a[b]);
        PaginationHelper.increasePage(), a.length < 20 && PaginationHelper.setLast(), this.resize()
    },
    showErrorMessage: function() {
        $("#error").addClass("active"), setTimeout(function() {
            $("#error").removeClass("active")
        }, 3e3)
    }
}, $(document).ready(function() {
    PathHelper.list = ["popular", "recent", "following", "shots", "likes"], PathHelper.init(), ChromeViewController.init(), LinksViewController.init()
});