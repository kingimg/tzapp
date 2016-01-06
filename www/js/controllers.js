angular.module('starter.controllers', [])


//angular.module('starter.controllers', []).directive('dateFormat', ['$filter', function ($filter) {
//    var dateFilter = $filter('date');  
//    return {  
//        require: 'ngModel',  
//        link: function(scope, elm, attrs, ctrl) {    
//            function formatter(value) {
//                return dateFilter(value, 'yyyy-MM-dd'); //format 
//            }    
//            function parser() {  
//                return ctrl.$modelValue;  
//            }  
//            ctrl.$formatters.push(formatter);  
//            ctrl.$parsers.unshift(parser);  
//        }  
//    };  
//}])

.constant('ApiEndpoint', {   
   //url: 'http://192.168.3.63:8085'    
    //url: 'http://tzapp2.safe110.net:8085'
    url: 'http://121.199.75.88:4138:8085'
})


.controller('ctrl-login', function ($scope, $ionicPopup, $http, $state, $ionicHistory, ApiEndpoint, $ionicLoading,$timeout) {
    $ionicHistory.nextViewOptions({ disableBack: true });
    //$scope.dologin = function () {
    //    if (window.localStorage["apikey"] != undefined) {
    //        //$state.go('menus.home');
    //        $state.go('menus.monitor-main');
    //    }
    //};
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: '密码失效或不正确!',
            template: '密码失效或不正确!'
        });
        alertPopup.then(function (res) {
            //console.log('Thank you for not eating my delicious ice cream cone');
        });
    };
    $scope.login = function (user) {
        ////if (user.username == null && user.password == null)
        ////{
        //    //user.username = "戴峰";
        //    user.password = "123456";
        ////}
        //    alert(0); return;
            var uname = "戴峰"; var upass = "123456";
        $http.get(ApiEndpoint.url + '/user/login/?loginName=' + uname + '&passWord=' + upass + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                window.localStorage['apikey'] = data.obj;
                $http.defaults.headers.common['apikey'] = window.localStorage["apikey"];
                //$state.go('menus.home');
                $state.go('menus.check-projects');
            } else {
                $scope.showAlert();
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                errCb(response);
            }
        });
    };

    $scope.login2 = function(user)
    {
        $scope.loginpictype = 0;
        makePhoto();
    };

    $scope.login3 = function (user) {
        $scope.loginpictype = 1;
        $ionicLoading.show({
            template: '正在请假...'
        });
        $http.post(ApiEndpoint.url + '/common/upload/?fixname=2&r=' + Math.random()).success(function (data) {
            $timeout(function () {
                $ionicLoading.show({
                    template: '请假成功', duration: 1000
                });
            }, 1000);
           
        });
    };

    function onPhotoDone(imageURI) {
        uploadPhoto(imageURI);
    }
    function onPhotoFail(message) {
        if (message.indexOf('cancelled') < 0) {
            alert('出錯了：' + message);
        }
    }
    function getPicArr() {
        var str = '';
        for (var i in $scope.photos) {
            str += $scope.photos[i].PicPath + ',';
        }
        return str.substr(0, str.lastIndexOf(','));
    }
    function uploadPhoto(imageURI) {
        var done = function (r) {
            var reg = eval('(' + r.response + ')');
            var photo = { PicPath: reg.obj, PicPath_s: imageURI };
            $scope.$apply(function () {
                $scope.photos.push(photo);
            });
        };

        var fail = function (e) {
            alert(e.code);
        };

        var options = new FileUploadOptions();
        options.fileKey = "fileAddPic";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1).split("?")[0];
        //如果是图片格式，就用image/jpeg，其他文件格式上官网查API
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        var ft = new FileTransfer();
        ft.upload(imageURI, encodeURI(ApiEndpoint.url + "/common/upload/?fixname=" + $scope.loginpictype + "&r=" + Math.random()), done, fail, options);
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
    //$scope.dologin();
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
            //alert('登录超时，请重新登录');
            //$scope.login();
            return;
        }
    });
})
    .controller('ctrl-monitor-devicedetail', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
        $scope.devicedetail = {};
        $http.post(ApiEndpoint.url + '/monitor/GetDeviceDetailInfo?deviceSN=' + $stateParams.deviceSN + '&monitorType=' + $stateParams.monitorType + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.devicedetail.MonitorType = $stateParams.monitorType;
                $scope.devicedetail.DeviceSN = $stateParams.deviceSN;
                $scope.devicedetail.FilingNO = data.obj.FilingNO;
                $scope.devicedetail.DeviceNO = data.obj.DeviceNO;
                $scope.devicedetail.OwnerCompanyName = data.obj.OwnerCompanyName;
                $scope.devicedetail.OwnerCompanyID = data.obj.OwnerCompanyID;
                $scope.devicedetail.ProjectName = data.obj.ProjectName;
                $scope.devicedetail.ProjectID = data.obj.ProjectID;
                $scope.devicedetail.ContractorCompanyName = data.obj.ContractorCompanyName;
                $scope.devicedetail.AlarmCount = data.obj.AlarmCount;
                $scope.devicedetail.OperateAlarmCount = data.obj.OperateAlarmCount;
                $scope.devicedetail.UnoperateAlarmCount = data.obj.UnoperateAlarmCount;
            } else {
                alert(data.msg);               
            }
        });
    })
    .controller('ctrl-monitor-devicedetail-info', function ($scope) {

    })
    .controller('ctrl-monitor-devicedetail-simulate', function ($scope) {

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
                    //alert('登录超时，请重新登录');
                    //$scope.login();
                    return;
                }
            });
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
                //alert(data.msg);
                //$state.go('login');
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
                //alert('登录超时，请重新登录');
                //$scope.login();
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
    var proName,checkUser;
    $scope.loadMore = function () {
        $http.post(ApiEndpoint.url + '/zaSys/checkList/?page=' + $scope.page + '&proid=' + $stateParams.proId + '&checkType=0,1,6&r=' + Math.random()).success(function (data) {
            if (data.success) {
                $scope.page_count = data.total;
                $scope.checks = $scope.checks.concat(data.rows);
                if (data.rows.length>0) { proName = data.rows[0].ProName; checkUser = data.rows[0].CheckUser; }
                $scope.page++;
                $scope.$broadcast("scroll.infiniteScrollComplete");
                if ($scope.page > $scope.page_count) {
                    $scope.load_over = false;
                    return;
                }
            } else {
                //alert('登录超时，请重新登录');
                //$scope.login();
                return;
            }
        })
    };
    $scope.doRefresh = function () {
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.addnew = function () {
        $state.go("menus.check-checkadd", { operType: 'add', proId: $stateParams.proId, proName: proName, checkUser: checkUser });
    };
})
.controller('ctrl-check-checkdetail', function ($scope, $stateParams, $window, $http, $ionicActionSheet, $filter, ApiEndpoint, $ionicLoading, $timeout) {
    $scope.checkdetail = {};
    $scope.photos = [];
    $scope.isedit = $stateParams.operType == 'edit';
    if ($stateParams.operType=='edit'){        
        $http.post(ApiEndpoint.url + '/zaSys/checkDetail/?checkId=' + $stateParams.checkId + '&r=' + Math.random()).success(function (data) {
            if (data.success) {               
                $scope.checkdetail.ProName = data.rows[0].ProName;
                $scope.checkdetail.CheckType = data.rows[0].CheckType;
                $scope.checkdetail.CheckMode = data.rows[0].CheckMode;
                $scope.checkdetail.CheckTime = $filter("date")(data.rows[0].CheckTime.replace(/\D/igm, "").trim(), 'yyyy-MM-dd');//'2011-11-11';//data.rows[0].CheckTime.replace(/\D/igm, "").trim();
                $scope.checkdetail.CheckUser = data.rows[0].CheckUser;
                $scope.checkdetail.Content1 = data.rows[0].F1;
                $scope.checkdetail.WebApiUrl = ApiEndpoint.url;
                //alert($scope.checkdetail.CheckTime);
                //alert(data.obj);
                if (data.obj) {
                    
                    for (var i = 0; i < data.obj.length;i++)
                    {
                        data.obj[i].PicPath_s = ApiEndpoint.url + data.obj[i].PicPath_s
                    }
                    $scope.photos = $scope.photos.concat(data.obj);
                }
            } else {
                //alert('登录超时，请重新登录');
                //$scope.login();
                alert(data);
                return;
            }
        })
    } else if ($stateParams.operType == 'add') {
        $scope.checkdetail.ProName = $stateParams.proName;
        $scope.checkdetail.CheckUser = $stateParams.checkUser;
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
    $scope.showPic = function (url) {        
        $window.open(url, '_blank', "width=100%,height=100%,resizable=1", '')
    };
    $scope.printcheck = function () {
        $http.post(ApiEndpoint.url + '/zaSys/printCheck/?checkID=' + $stateParams.checkId).success(function (data) {
            if (data.success) {
                //$ionicLoading.show({
                //    template: '正在签名...'
                //});
                //$timeout(function () {
                //    $ionicLoading.show({
                //        template: '签名成功...'
                //    });
                //},1000);
                $ionicLoading.show({
                    template: '正在生成打印文件……'
                });
                $timeout(function () {
                    $ionicLoading.show({
                        template: '打印文件已生成！', duration: 1000
                    });
                }, 1000);
                $timeout(function () {
                    $ionicLoading.show({
                        template: '发送打印命令……', duration: 500
                    });
                }, 1500);
                $timeout(function () {
                    $ionicLoading.show({
                        template: '打印命令发送成功！', duration: 1000
                    });
                }, 2500);
                //var extraInfo = cordova.require('cn.net.wenzhixin.cordova.ExtraInfo');

                //extraInfo.getExtra(function (message) {
                //     alert(message);
                //}, function (message) {
                    // alert(message);
                //});
            } else {
                //alert('登录超时，请重新登录');
                //$scope.login();
                return;
            }
        })
    };
    $scope.printcheck2 = function () {
        //var uri = encodeURI(ApiEndpoint.url + "/1.pdf");
        //var fileTransfer = new FileTransfer(); 
        //fileTransfer.download(
        //    uri,
        //    window.appRootDir + "1.pdf",
        //    function (entry) {
        //        alert("download complete: " + entry.toURL());
        //    },
        //    function (error) {
        //        //console.log("download error source " + error.source);
        //        //console.log("download error target " + error.target);
        //        //console.log("upload error code" + error.code);
        //    }
        //);
        var filepath = "file:///storage/emulated/0/andriod/data/net.safe110.tzapp/cache/1.pdf";
        //filepath = "www/res/file.pdf";
        
        //window.plugins.socialsharing.shareVia('epson.print', '检查文件', filepath, filepath, null, function () { console.log('share ok') }, function (msg) { alert('error: ' + msg) });
        window.plugins.socialsharing.share('检查文件', "subject", filepath);
    };
    $scope.savecheck = function () {
        if ($stateParams.operType == 'edit') {
            
            var pics = getPicArr();            
            $http.post(ApiEndpoint.url + '/zaSys/editCheck/?checkId=' + $stateParams.checkId + '&checkType=' + $scope.checkdetail.CheckType + '&checkTime=' + $scope.checkdetail.CheckTime + '&checkUser=' + $scope.checkdetail.CheckUser + '&content1=' + $scope.checkdetail.Content1 + '&pics=' + pics + '&r=' + Math.random()).success(function (data) {
                if (data.success) {

                    $ionicLoading.show({
                        template: '修改成功！', duration: 1000
                    });
                } else {
                    //alert('登录超时，请重新登录');
                    //$scope.login();
                    return;
                }
            })
        } else if ($stateParams.operType == 'add') {
            var pics = getPicArr();            
            var checkdate = $filter("date")($scope.checkdetail.CheckTime, 'yyyy-MM-dd');
            $http.post(ApiEndpoint.url + '/zaSys/addCheck/?proId=' + $stateParams.proId + '&checkType=' + $scope.checkdetail.CheckType + '&checkMode=' + $scope.checkdetail.CheckMode + '&checkTime=' + checkdate + '&checkUser=' + $scope.checkdetail.CheckUser + '&content1=' + $scope.checkdetail.Content1 + '&pics=' + pics + '&r=' + Math.random()).success(function (data) {
                if (data.success) {                    
                    $ionicLoading.show({
                    template: '保存成功！', duration: 1000
                    });
                } else {
                    //alert('登录超时，请重新登录');
                    //$scope.login();
                    return;
                }
            })
        }
    };
    function onPhotoDone(imageURI) { 
        uploadPhoto(imageURI); alert(imageURI);
    }
    function onPhotoFail(message) {       
        if (message.indexOf('cancelled') < 0) {
            alert('出錯了：' + message);
        }
    }
    function getPicArr() {
        var str = '';
        for (var i in $scope.photos) {           
            str += $scope.photos[i].PicPath+',';
        }
        return str.substr(0, str.lastIndexOf(','));
    }
    function uploadPhoto(imageURI) {        
        var done = function (r) {
            var reg = eval('(' + r.response + ')');
            var photo = { PicPath: reg.obj, PicPath_s: imageURI };            
            $scope.$apply(function () {
                $scope.photos.push(photo);
            });      
        };

        var fail = function (e) {
            alert(e.code);          
        };

        var options = new FileUploadOptions();
        options.fileKey = "fileAddPic";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1).split("?")[0];
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

.controller('ctrl-board-projectdetail', function ($scope, $stateParams, $http, ApiEndpoint) {
    $scope.projectDetail = {};
    $scope.checks = [];
    $scope.persons = [];
    $scope.devices = [];
    $scope.IsLoadForMonitor = true;
    $scope.IsLoadForCheck = true;
    $scope.IsLoadForPerson = true;
    $scope.shownGroup = 1;
    $scope.toggleGroup = function (index) {        
        if ($scope.isGroupShown(index)) {
            $scope.shownGroup = null;
        } else {           
            $scope.shownGroup = index;
            if ($scope.IsLoadForMonitor && index == 3) {
                $http.post(ApiEndpoint.url + '/monitor/getRegisterList/?r=' + Math.random()).success(function (data) {
                    if (data.success) {
                        $scope.devices = $scope.devices.concat(data.rows);
                        $scope.IsLoadForMonitor = false;
                    }
                })
            } else if ($scope.IsLoadForCheck && index == 5) {
                $http.post(ApiEndpoint.url + '/zaSys/checkList/?page=1&rows=10000&proid=' + $stateParams.proId + '&checkType=2&r=' + Math.random()).success(function (data) {
                    if (data.success) {
                        $scope.checks = $scope.checks.concat(data.rows);
                        $scope.IsLoadForCheck = false;                        
                    }
                })
            } else if ($scope.IsLoadForPerson && index == 6) {
                $http.post(ApiEndpoint.url + '/zaSys/getProPerList/?proid=' + $stateParams.proId + '&r=' + Math.random()).success(function (data) {
                    if (data.success) {
                        $scope.persons = $scope.persons.concat(data.rows);
                        $scope.IsLoadForPerson = false;
                    }
                })
            }
        }
    };
    $scope.isGroupShown = function (index) {
        return $scope.shownGroup === index;       
    };    
    $http.post(ApiEndpoint.url + '/zaSys/getProjectDetail?proId=' + $stateParams.proId + '&r=' + Math.random()).success(function (data) {
        if (data.success) {
            $scope.projectDetail.RegNumber = data.obj[0].RegNumber;
            $scope.projectDetail.ShigongUnitName = data.obj[0].ShigongUnitName;
            $scope.projectDetail.ConsUnitName = data.obj[0].ConsUnitName;
            $scope.projectDetail.ProUsers = data.obj[0].ProUsers;
            $scope.projectDetail.JiaoDiDate = data.obj[0].JiaoDiDate;
            $scope.projectDetail.CheckCount = data.obj[0].CheckCount;
            $scope.projectDetail.CheckCount1 = data.obj[0].CheckCount1;
            $scope.projectDetail.noticeNum = data.obj[0].noticeNum;
            $scope.projectDetail.closeNum = data.obj[0].closeNum;
            $scope.projectDetail.LastCheckTime = data.obj[0].LastCheckTime;
            $scope.projectDetail.Target1 = data.obj[0].Target1;
            $scope.projectDetail.Count1 = data.obj[0].Count1;
            $scope.projectDetail.Target2 = data.obj[0].Target2;
            $scope.projectDetail.Count2 = data.obj[0].Count2;
            $scope.projectDetail.Target3 = data.obj[0].Target3;
            $scope.projectDetail.Count3 = data.obj[0].Count3;
            $scope.projectDetail.Target4 = data.obj[0].Target4;
            $scope.projectDetail.Count4 = data.obj[0].Count4;
            $scope.projectDetail.CountTotal = data.obj[0].Count1 + data.obj[0].Count2 + data.obj[0].Count3 + data.obj[0].Count4;
            $scope.projectDetail.TargetTotal = data.obj[0].Target1 + data.obj[0].Target2 + data.obj[0].Target3 + data.obj[0].Target4;
        } else {
            alert(data.msg);
            $state.go('login');
        }
    });
})

.controller('ctrl-account-main', function ($scope, $ionicPopup, $state, $http, ApiEndpoint, $window) {
    $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
            title: '密码失效或不正确!',
            template: '密码失效或不正确'
        });
        alertPopup.then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };

    $scope.exit = function () {
        $http.get(ApiEndpoint.url + '/user/exit/?r=' + Math.random()).success(function (data) {
            if (data.success) {
                window.localStorage.removeItem('apikey'); $http.defaults.headers.common['apikey'] = "";
                $state.go('login');
            } else {
                //$scope.showAlert();
                window.localStorage.removeItem('apikey'); $http.defaults.headers.common['apikey'] = "";
                $state.go('login');
                //alert(data.msg);
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                //errCb(response);
            }
        });
    };
    $scope.scancheck = function () {
        cordova.plugins.barcodeScanner.scan(
          function (result) {
              if (!result.cancelled)
              {
                  $window.open("http://tzapp.safe110.net:8085/checkresult.html?code=" + result.text, '_blank', "width=100%,height=100%,resizable=1", '');
              }             
          },
          function (error) {
              //alert("Scanning failed: " + error);
          }
       );

       // $window.open("http://tzapp.safe110.net:8085/checkresult.html", '_blank', "width=100%,height=100%,resizable=1", '');
    };
})
.controller('ctrl-account-userinfo', function ($scope) {

})
.controller('ctrl-account-zone', function ($scope) {

})

.controller('ctrl-common-companydetail', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
    $scope.companydetail = {};
    $http.post(ApiEndpoint.url + '/basic/GetDeviceCompanyDetailInfo?deviceSN=' + $stateParams.deviceSN + '&monitorType=' + $stateParams.monitorType + '&r=' + Math.random()).success(function (data) {
        if (data.success) {
            $scope.companydetail.CompanyName = data.obj.ContractorCompanyName;
            if($stateParams.companyType=="1")
            { 
                $scope.companydetail.CompanyType = "施工单位";
                $scope.companydetail.CompanyAddress = data.obj.ContractorCompanyAddress;
                $scope.companydetail.TecPerson = data.obj.TechniqueMan;
                $scope.companydetail.LinkPhone = data.obj.TechniqueTel;
                $scope.companydetail.WebUrl = data.obj.ContractorCompanyWebUrl;
                $scope.companydetail.Fax = data.obj.ContractorCompanyFax;
            }
            else
            {
                $scope.companydetail.CompanyType = "产权单位";
                $scope.companydetail.CompanyAddress = data.obj.OwnerCompanyAddress;
                $scope.companydetail.TecPerson = data.obj.OwnerCompanyTechniqueMan;
                $scope.companydetail.LinkPhone = data.obj.OwnerCompanyTechniqueTel;
                $scope.companydetail.WebUrl = data.obj.OwnerCompanyWebUrl;
                $scope.companydetail.Fax = data.obj.OwnerCompanyFax;
            }
        } else {
            alert(data.msg);
        }
    });
})
.controller('ctrl-common-projectdetail', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
    $scope.projectdetail = {};
    $http.post(ApiEndpoint.url + '/basic/GetDeviceCompanyDetailInfo?deviceSN=' + $stateParams.deviceSN + '&monitorType=' + $stateParams.monitorType + '&r=' + Math.random()).success(function (data) {
        if (data.success) {
            $scope.projectdetail.ProjectName = data.obj.ProjectName;
            $scope.projectdetail.ProjectAddress = data.obj.ProjectAddress;
            $scope.projectdetail.AreaAddress = data.obj.AreaAddress;
            $scope.projectdetail.StationName = data.obj.StationName;
            $scope.projectdetail.ContractorCompanyName = data.obj.ContractorCompanyName;
            $scope.projectdetail.ContractorCompanyName = data.obj.ContractorCompanyName;
            $scope.projectdetail.SupervisionCompanyName = data.obj.SupervisionCompanyName;
        } else {
            alert(data.msg);
        }
    });
})
;




