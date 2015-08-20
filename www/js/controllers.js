﻿//angular.module('starter.controllers', [])


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
    //url: 'http://192.168.1.223:8085'  
    url: 'http://tzapp.safe110.net:8085'
})


.controller('ctrl-login', function ($scope, $ionicPopup, $http, $state, $ionicHistory, ApiEndpoint) {
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
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };
    $scope.login = function (user) {        
        $http.get(ApiEndpoint.url + '/user/login/?loginName=' + user.username + '&passWord=' + user.password + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
                window.localStorage['apikey'] = data.obj;
                $http.defaults.headers.common['apikey'] = window.localStorage["apikey"];
                //$state.go('menus.home');
                $state.go('menus.monitor-main');
            } else {
                $scope.showAlert();
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                errCb(response);
            }
        });
    };
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
            alert('登录超时，请重新登录');
            $scope.login();
            return;
        }
    });
})
    .controller('ctrl-monitor-devicedetail', function ($scope, $stateParams, $http, $state, ApiEndpoint) {
        $scope.devicedetail = {};
        $http.post(ApiEndpoint.url + '/monitor/GetDeviceDetailInfo?deviceSN=' + $stateParams.deviceSN + '&monitorType=' + $stateParams.monitorType + '&r=' + Math.random()).success(function (data) {
            if (data.success) {
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
        $state.go("menus.check-checkadd", { operType: 'add', proId: $stateParams.proId, proName: proName, checkUser: checkUser });
    };
})
.controller('ctrl-check-checkdetail', function ($scope, $stateParams, $window, $http ,$ionicActionSheet, ApiEndpoint) {
    $scope.checkdetail = {};
    $scope.photos = [];
    if ($stateParams.operType=='edit'){        
        $http.post(ApiEndpoint.url + '/zaSys/checkDetail/?checkId=' + $stateParams.checkId + '&r=' + Math.random()).success(function (data) {
            if (data.success) {               
                $scope.checkdetail.ProName = data.rows[0].ProName;
                $scope.checkdetail.CheckType = data.rows[0].CheckType;
                $scope.checkdetail.CheckTime = data.rows[0].CheckTime;                
                $scope.checkdetail.CheckUser = data.rows[0].CheckUser;
                $scope.checkdetail.Content1 = data.rows[0].Content1;
                $scope.checkdetail.WebApiUrl = ApiEndpoint.url;
                if (data.obj) { $scope.photos = $scope.photos.concat(data.obj); }                 
            } else {
                alert('登录超时，请重新登录');
                $scope.login();
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
    $scope.savecheck = function () {
        if ($stateParams.operType == 'edit') {
            var pics = getPicArr();
            $http.post(ApiEndpoint.url + '/zaSys/editCheck/?checkId=' + $stateParams.checkId + '&checkType=' + $scope.checkdetail.CheckType + '&checkTime=' + $scope.checkdetail.CheckTime + '&checkUser=' + $scope.checkdetail.CheckUser + '&content1=' + $scope.checkdetail.Content1 + '&pics=' + pics + '&r=' + Math.random()).success(function (data) {
                if (data.success) {
                    alert("修改成功！");
                } else {
                    alert('登录超时，请重新登录');
                    $scope.login();
                    return;
                }
            })
        } else if ($stateParams.operType == 'add') {
            var pics = getPicArr();            
            var now = new Date(Date.parse($scope.checkdetail.CheckTime));
            var year = now.getFullYear(); var month = now.getMonth() + 1; var date = now.getDate();
            $http.post(ApiEndpoint.url + '/zaSys/addCheck/?proId=' + $stateParams.proId + '&checkType=' + $scope.checkdetail.CheckType + '&checkTime=' + year + "-" + month + "-" + date + '&checkUser=' + $scope.checkdetail.CheckUser + '&content1=' + $scope.checkdetail.Content1 + '&pics=' + pics + '&r=' + Math.random()).success(function (data) {
                if (data.success) {
                    alert("保存成功！");
                } else {
                    alert('登录超时，请重新登录');
                    $scope.login();
                    return;
                }
            })
        }
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
            str += $scope.photos[i].PicPath+',';
        }
        return str.substr(0, str.lastIndexOf(','));
    }
    function uploadPhoto(imageURI) {        
        var done = function (r) {
            var reg = eval('(' + r.response + ')');
            var photo = { PicPath: reg.obj , PicPath_s: imageURI };
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

.controller('ctrl-account-main', function ($scope, $ionicPopup, $state, $http, ApiEndpoint) {
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
                $scope.showAlert();
                //alert(data.msg);
            }
        }).error(function (response) {
            if (errCb && typeof errCb === 'function') {
                //errCb(response);
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



