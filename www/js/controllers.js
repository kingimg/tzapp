//angular.module('starter.controllers', [])


angular.module('starter.controllers', []).directive('dateFormat', ['$filter', function ($filter) {
    var dateFilter = $filter('date');  
    return {  
        require: 'ngModel',  
        link: function(scope, elm, attrs, ctrl) {    
            function formatter(value) {
                return dateFilter(value, 'yyyy-MM-dd'); //format 
            }    
            function parser() {  
                return ctrl.$modelValue;  
            }  
            ctrl.$formatters.push(formatter);  
            ctrl.$parsers.unshift(parser);  
        }  
    };  
}])

.constant('ApiEndpoint', {
    url: 'http://tzapp.safe110.net:8085'  
//url: 'http://192.168.1.214:8085'  
})


.controller('ctrl-login', function ($scope, $http, $state, $ionicHistory, ApiEndpoint) {
    $ionicHistory.nextViewOptions({ disableBack: true });
    $scope.dologin = function () {
        if (window.localStorage["apikey"] != undefined) {
            //$state.go('menus.home');
            $state.go('menus.monitor-main');
        }
    };
    $scope.login = function (user) {
        $http.get(ApiEndpoint.url + '/user/login/?loginName=' + user.username + '&passWord=' + user.password + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                window.localStorage['apikey'] = data.obj;
                $http.defaults.headers.common['apikey'] = window.localStorage["apikey"];
                //$state.go('menus.home');
                $state.go('menus.monitor-main');
            } else {
                alert(data.msg);
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                errCb(response);
            }
        });
    };
    $scope.dologin();
})
.controller('ctrl-home', function ($scope) {

})
.controller('ctrl-monitor-main', function ($scope, $http, $state, ApiEndpoint) {
    $scope.homeData = {};
    $http.post(ApiEndpoint.url + '/monitor/getDeviceCount?r=' + Math.random()).success(function (data) {
        if (data.success) {
            $scope.homeData.TD = data.rows.TD;//塔式起重机
            $scope.homeData.SJJ = data.rows.SJJ;//施工升降机
            $scope.homeData.WL = data.rows.WL;//物料提升机
            $scope.homeData.QT = data.rows.QT;//其它设备
            $scope.homeData.Total = data.rows.Total;//已备案设备总数

            $scope.homeData.TotalRegisted = data.rows.TotalRegisted;//受监控的总量
            $scope.homeData.TCRegisted = data.rows.TCRegisted;//登记塔吊
            $scope.homeData.TCOnline = data.rows.TCOnline;//在线塔吊
            $scope.homeData.TCOffline = data.rows.TCOffline;//离线塔吊
            $scope.homeData.TCAlarm = data.rows.TCAlarm == undefined ? 0 : data.rows.TCAlarm;//违章塔吊
            $scope.homeData.ERegisted = data.rows.ERegisted;//登记人货梯
            $scope.homeData.EOnline = data.rows.EOnline;//在线人货梯
            $scope.homeData.EOffline = data.rows.EOffline;//离线人货梯
            $scope.homeData.EAlarm = data.rows.EAlarm == undefined ? 0 : data.rows.EAlarm;//违章人货梯
        } else {
            alert(data.msg);
            $state.go('login');
        }
    });
})
.controller('ctrl-monitor-devices', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
    var url = "";
    $scope.devices = [];
    switch ($stateParams.monitorStatus) {
        case '1': url = '/monitor/getRegisterList?monitorType=' + $stateParams.monitorType + '&r=' + Math.random(); break;
        case '2': url = '/monitor/getOnlineDevice?monitorType=' + $stateParams.monitorType + '&r=' + Math.random(); break;
        case '3': url = '/monitor/getTodayAlarmList?monitorType=' + $stateParams.monitorType + '&r=' + Math.random(); break;
    }
    $http.post(ApiEndpoint.url + url).success(function (data) {
        if (data.success) {
            $scope.devices = $scope.devices.concat(data.rows);
            $scope.$broadcast("scroll.infiniteScrollComplete");           
        } else {
            alert('登录超时，请重新登录');
            $scope.login();
            return;
        }
    });
})
    .controller('ctrl-monitor-devicedetail', function ($scope) {

    })
    .controller('ctrl-monitor-devicedetail-info', function ($scope) {

    })
    //.controller('ctrl-monitor-elevators', function ($scope) {

    //})
    //.controller('ctrl-monitor-elevatordetail', function ($scope) {

    //})
    //.controller('ctrl-monitor-elevatordetail-info', function ($scope) {

    //})
    .controller('ctrl-monitor-machinerys', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
        $scope.machinerys = [];
        $scope.page = 1;
        $scope.page_count = 1;
        $scope.load_over = true;
        $scope.loadMore = function () {
            $http.post(ApiEndpoint.url + '/filing/getFilingMachinerys/?page=' + $scope.page + '&machinerysType=' + $stateParams.machinerysType + '&r=' + Math.random()).success(function (data) {
                if (data.success) {
                    $scope.page_count = data.total;
                    $scope.machinerys = $scope.machinerys.concat(data.rows);
                    $scope.page++;
                    $scope.$broadcast("scroll.infiniteScrollComplete");
                    if ($scope.page > $scope.page_count) {
                        $scope.load_over = false;
                        return;
                    }
                } else {
                    alert('登录超时，请重新登录');
                    $scope.login();
                    return;
                }
            })
        };
        $scope.doRefresh = function () {
            $scope.$broadcast('scroll.refreshComplete');
        };
    })
    .controller('ctrl-monitor-machinerydetail', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
        $scope.machinerydetail = {};
        $http.post(ApiEndpoint.url + '/filing/getFilingMachineryDetail?baId=' + $stateParams.baId + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.machinerydetail.BeiAnICP = data.rows.BeiAnICP;
                $scope.machinerydetail.SpecificationModel = data.rows.SpecificationModel;
                $scope.machinerydetail.IsOutland = data.rows.IsOutland == 0 ? "本地机械" : "外地机械";
                $scope.machinerydetail.ApplyMan = data.rows.ApplyMan;
                $scope.machinerydetail.MadeDate = data.rows.MadeDate;
                $scope.machinerydetail.UseEndDate = data.rows.UseEndDate;
                $scope.machinerydetail.FactoryNO = data.rows.FactoryNO;
                $scope.machinerydetail.FactoryName = data.rows.FactoryName;
                $scope.machinerydetail.PropertyCompanyName = data.rows.PropertyCompanyName;
            } else {
                alert(data.msg);
                $state.go('login');
            }
        });
    })
    .controller('ctrl-monitor-warnings', function ($scope) {

    })
.controller('ctrl-check-projects', function ($scope, $http, $state, ApiEndpoint) {
    $scope.projects = [];
    $scope.page = 1;
    $scope.page_count = 1;
    $scope.load_over = true;
    $scope.loadMore = function () {
        $http.post(ApiEndpoint.url + '/zaSys/checkProList/?page=' + $scope.page + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.page_count = data.total;
                $scope.projects = $scope.projects.concat(data.rows);
                $scope.page++;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                if ($scope.page > $scope.page_count) {
                    $scope.load_over = false;
                    return;
                }
            } else {
                alert('登录超时，请重新登录');
                $scope.login();
                return;
            }
        })
    };
    //$scope.moreDataCanBeLoaded = function () { return CheckProjects.hasmore; };
    $scope.doRefresh = function () {
        $scope.$broadcast('scroll.refreshComplete');
    };
})

.controller('ctrl-check-checks', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
    $scope.checks = [];
    $scope.page = 1;
    $scope.page_count = 1;
    $scope.load_over = true;
    $scope.loadMore = function () {
        $http.post(ApiEndpoint.url + '/zaSys/checkList/?page=' + $scope.page + '&proid=' + $stateParams.proId + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.page_count = data.total;
                $scope.checks = $scope.checks.concat(data.rows);
                $scope.page++;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                if ($scope.page > $scope.page_count) {
                    $scope.load_over = false;
                    return;
                }
            } else {
                alert('登录超时，请重新登录');
                $scope.login();
                return;
            }
        })
    };
    $scope.doRefresh = function () {
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.addnew = function () {
        $state.go("menus.check-checkadd", { operType:'add', proId: $stateParams.proId });
    };
})
.controller('ctrl-check-checkdetail', function ($scope, $stateParams, $http ,$ionicActionSheet, ApiEndpoint) {
    $scope.checkdetail = {};
    $scope.photos = [];
    if ($stateParams.operType=='edit'){        
        $http.post(ApiEndpoint.url + '/zaSys/checkDetail/?checkId=' + $stateParams.checkId + '&r=' + Math.random()).success(function (data) {
            if (data.success) {               
                $scope.checkdetail.ProName = data.rows[0].ProName;
                $scope.checkdetail.CheckTypeName = data.rows[0].CheckTypeName;
                $scope.checkdetail.CheckTime = data.rows[0].CheckTime;
                $scope.checkdetail.CheckUser = data.rows[0].CheckUser;
                $scope.checkdetail.Content1 = data.rows[0].Content1;
                $scope.photos = $scope.photos.concat(data.obj);
            } else {
                alert('登录超时，请重新登录');
                $scope.login();
                return;
            }
        })
    }
    
    $scope.showActionsheet = function () {
        $ionicActionSheet.show({
            titleText: '上传现场照片',
            cancelText: '取消',
            buttons: [{ text: '拍照' }, { text: '从相册中选取' }],
            cancel: function () { },
            buttonClicked: function (index) {
                switch (index) {
                    case 1: takePhoto(); break;
                    case 0:
                    default: makePhoto(); break;
                }
                return true;
            }
        });                    
    };
    $scope.savecheck = function () {
        if ($stateParams.operType == 'edit'){
            $http.post(ApiEndpoint.url + '/zaSys/editCheck/?checkId=' + $stateParams.checkId + '&checkTypeName=' + $scope.checkdetail.CheckTypeName + '&checkTime=' + $scope.checkdetail.CheckTime + '&checkUser=' + $scope.checkdetail.CheckUser + '&content1=' + $scope.checkdetail.Content1 + '&r=' + Math.random()).success(function (data) {
                if (data.success) {
                    
                } else {
                    alert('登录超时，请重新登录');
                    $scope.login();
                    return;
                }
            })
        }
    };
    function onPhotoDone(imageURI) {       
        //$scope.photos.push(photo);
        uploadPhoto(imageURI);
    }
    function onPhotoFail(message) {       
        if (message.indexOf('cancelled') < 0) {
            alert('出錯了：' + message);
        }
    }
    function uploadPhoto(imageURI) {        
        var done = function (r) {
            var reg = eval('(' + r.response + ')');
            var photo = { PicPath:reg.obj,PicPath_s: imageURI };
            var temparr = [];
            temparr.push(photo);
            $scope.photos = $scope.photos.concat(temparr);
            //ybb_user.profile.avatar = json.avatar_src;         
        };

        var fail = function (e) {
            alert(e.code);          
        };

        var options = new FileUploadOptions();
        options.fileKey = "fileAddPic";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        //如果是图片格式，就用image/jpeg，其他文件格式上官网查API
        options.mimeType = "image/jpeg";          
        options.chunkedMode = false;
        var ft = new FileTransfer();               
        ft.upload(imageURI, encodeURI(ApiEndpoint.url + "/common/upload/?r=" + Math.random()), done, fail, options);    
    }
    function makePhoto() {
        navigator.camera.getPicture(onPhotoDone, onPhotoFail, {
            quality: 100, targetWidth: 800, targetHeight: 800, destinationType: navigator.camera.DestinationType.FILE_URI
        });
    }
    function takePhoto() {
        navigator.camera.getPicture(onPhotoDone, onPhotoFail, {
            quality: 100, targetWidth: 800, targetHeight: 800, destinationType: navigator.camera.DestinationType.FILE_URI
        , sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
        });
    }
})
.controller('ctrl-board-projects', function ($scope, $http, $state, ApiEndpoint) {
    $scope.projects = [];
    $scope.page = 1;
    $scope.page_count = 1;
    $scope.load_over = true;
    $scope.loadMore = function () {
        $http.post(ApiEndpoint.url + '/zaSys/checkProList/?page=' + $scope.page + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.page_count = data.total;
                $scope.projects = $scope.projects.concat(data.rows);
                $scope.page++;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                if ($scope.page > $scope.page_count) {
                    $scope.load_over = false;
                    return;
                }
            } else {
                alert('登录超时，请重新登录');
                $scope.login();
                return;
            }
        })
    };
    $scope.doRefresh = function () {
        $scope.$broadcast('scroll.refreshComplete');
    };
})

.controller('ctrl-board-projectdetail', function ($scope, $stateParams, BoardProjects) {
    $scope.shownGroup = 1;
    $scope.toggleGroup = function (index) {
        if ($scope.isGroupShown(index)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = index;
        }
    };
    $scope.isGroupShown = function (index) {
        return $scope.shownGroup === index;
    };
})

.controller('ctrl-account-main', function ($scope, $state, $http, ApiEndpoint) {
    $scope.exit = function () {
        $http.get(ApiEndpoint.url + '/user/exit/?r=' + Math.random()).success(function (data) {
            if (data.success) {
                window.localStorage.removeItem('apikey'); $http.defaults.headers.common['apikey'] = "";
                $state.go('login');
            } else {
                alert(data.msg);
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                errCb(response);
            }
        });
    };
})
.controller('ctrl-account-userinfo', function ($scope) {

})
.controller('ctrl-account-zone', function ($scope) {

})

.controller('ctrl-common-companydetail', function ($scope) {

})
.controller('ctrl-common-projectdetail', function ($scope) {

})
;




