import HomePage from "app/(tabs)/homepage";

export default {
    common: {
      welcome: "🌟 مرحبًا بكم في",
      appName: "تطبيق نبض النقب",
      language: "اللغة",
      currentLanguage: "العربية"
    },
    villages: {
      title: "القرى غير المعترف بها في النقب"
    },
    auth: {
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      login: {
        title: "تسجيل الدخول",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        button: "دخول",
        noAccount: "ليس لديك حساب؟ ",
        signupLink: "إنشاء حساب"
      },
      signup: {
        title: "إنشاء حساب",
        name: "الاسم",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        roleLocal: "مقيم محلي",
        roleEmergency: "مسعف",
        button: "تسجيل",
        passwordMismatch: "كلمات المرور غير متطابقة",
        successMessage: "تم إنشاء الحساب بنجاح	",
        loginLink:"تسجيل الدخول	",
        loginPrompt:"هل لديك حساب بالفعل؟	",
        roleLabel:"نوع الحساب:	",
        unexpectedError:"حدث خطأ غير متوقع	 ",
      }
    },
    tabs: {
      home: "الرئيسية",
      contact: "اتصل بنا",
      about: "حول",
      update: "تحديث",
      map: "الخريطة",
      location: "الموقع"
    },
    localPage: {
      title: "لوحة المقيم المحلي",
      communityAlerts: "تنبيهات المجتمع",
      quickActions: "إجراءات سريعة",
      recentUpdates: "التحديثات الأخيرة",
      reportIssue: "الإبلاغ عن مشكلة",
      contactAuthorities: "الاتصال بالسلطات",
      alerts: {
        roadConstruction: "إنشاء طريق جديد",
        townMeeting: "اجتماع بلدي قادم",
        waterMaintenance: "إشعار صيانة المياه"
      },
      quick_actions: "إجراءات سريعة",
      report_issue: "الإبلاغ عن مشكلة",
      contact_authorities: "الاتصال بالسلطات",
      updates: "آخر التحديثات",
      updatesText: "أحدث الأخبار والتحديثات المجتمعية ستظهر هنا. تحقق بانتظام للحصول على معلومات مهمة."
    },
    HomePage:{
      startingPoint: "نقطة البداية",
      destination: "الوجهة",
      setStartingPoint: "تعيين نقطة البداية",
      setDestination: "تعيين الوجهة",
      goToStart: "اذهب إلى البداية",
      goToDestination: "اذهب إلى الوجهة",
      showRoute: "عرض المسار",
      loading: "جارٍ التحميل...",
      routeInformation: "معلومات المسار",
      distance: "المسافة",
      duration: "المدة الزمنية",
      enterStartingAddress: "يرجى إدخال عنوان نقطة البداية",
      enterDestinationAddress: "يرجى إدخال عنوان الوجهة",
      couldNotFindLocation: "تعذر العثور على الموقع. حاول عنوانًا آخر.",
      pleaseSetBothPoints: "يرجى تعيين نقطة البداية والوجهة.",
      failedFetchRoute: "فشل في جلب المسار. حاول لاحقًا.",
      currentLocation: "الموقع الحالي",
      startpoint:"نقطة البداية"


    },
    landmarks: {
      "algergawiShop": "دكان الجرجاوي",
      "electricityPole": "عمود كهرباء",
      "electricCompany": "شركة الكهرباء",
      "azazmaSchool": "مدرسة العزازمة",
      "algergawiMosque": "مسجد الجرجاوي",
      "abuSwilimMaterials": "مواد بناء أبو سُويلم",
      "abuSwilimMosque": "مسجد أبو سُويلم",
      "abuMuharibButcher": "ملحمة أبو محارب",
      "mauhidetClinic": "عيادة موحدة",
      "dentalClinic": "عيادة أسنان عامة",
      "electricCompanyEntry": "مدخل شركة الكهرباء",
      "greenContainer": "الحاوية الخضراء"
    },
      about: {
        "title": "من نحن",
        "subtitle": "تحسين الوصول في حالات الطوارئ من خلال بيانات جغرافية دقيقة",
        "missionTitle": "مهمتنا",
        "missionText": "تواجه خدمات الطوارئ في إسرائيل صعوبات في الوصول إلى المناطق غير المعترف بها...",
        "problemTitle": "المشكلة",
        "problemList": {
          "lackData": "نقص في البيانات الجغرافية الدقيقة",
          "delays": "تأخير في أوقات الاستجابة",
          "limitedInfo": "معلومات محدودة"
        },
        "goalTitle": "هدفنا",
        "goalText": "منصتنا تجمع وتحمل بيانات جغرافية دقيقة...",
        "howItWorksTitle": "كيف يعمل",
        "step1": "جمع البيانات: تضيف المجتمعات المحلية معلومات جغرافية دقيقة.",
        "step2": "بناء قاعدة البيانات: يتم تحميل المعلومات وتخزينها في قاعدة بيانات مركزية.",
        "step3": "الوصول لخدمات الطوارئ: تصل خدمات الطوارئ إلى القاعدة للرجوع السريع.",
        "visionTitle": "رؤيتنا للمستقبل",
        "visionText": "نحن نتخيل مستقبلاً تُغطى فيه جميع المناطق غير المعترف بها في إسرائيل...",
        "contactTitle": "اتصل بنا",
        "contactText": "هل لديك أسئلة؟ تواصل معنا على"
      },
      
        contactUs: {
          "title": "اتصل بنا",
          "asraa": {
            "name": "أسراء الجرجاوي",
            "email": "asraaalgergawi@gmail.com",
            "phone": "0523694162"
          },
          "tasneem": {
            "name": " تسنيم اشنيور",
            "email": "tasnesh@ac.sce.ac.il",
            "phone": "0523694162"
          },
          "somaya": {
            "name": " سمية أبو سمور",
            "email": "ssomaya252@gmail.com",
            "phone": "0523694162"
          }
        }
      
      
    
    
  };