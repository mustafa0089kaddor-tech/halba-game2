# الدفعة الرابعة: إضافات لفئات بيكسار ومارفل. كل سؤال: (نقاط، سؤال، إجابة، [٣ خاطئة]، مصدر، وسيط، بيانات)
# بيانات = {"flags": [religious|film|character], "source": "رابط https للمصدر → يُحوَّل إلى QR"}
def Q(p,q,a,d,s=None,m=None,meta=None): return (p,q,a,d,s,m,meta)
X = {
 "pixar":[
  Q(200,"ما اسم الدمية الرئيسية في فيلم «قصة لعبة» (Toy Story)؟","وودي",["باز لايتير","بيست","جيسي"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Toy_Story"}),
  Q(200,"ما اسم الروبوت الصغير الذي يجمع النفايات في فيلم «وول-إي»؟","وول-إي",["إيف","ماكس","بيتا"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/WALL-E"}),
  Q(200,"في فيلم «راتاتوي» ما نوع الحيوان الذي يحلم بأن يصبح طاهياً؟","فأر",["قط","بطريق","ضفدع"],None,None,{"flags":["film"],"source":"https://en.wikipedia.org/wiki/Ratatouille_(film)"}),
  Q(400,"ما اسم والد نيمو في فيلم «البحث عن نيمو»؟","مارلن",["دوري","بروس","غيل"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Finding_Nemo"}),
  Q(400,"ما اسم السيارة الحمراء البطلة في فيلم «سيارات» (Cars)؟","برق ماكوين",["ماتير","دوك هدسون","سالي"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Cars_(film)"}),
  Q(600,"من مخرج فيلم «إنسايد آوت» (Inside Out)؟","بيت دوكتر",["أندرو ستانتون","براد بيرد","جون لاسيتر"],None,None,{"flags":["film"],"source":"https://en.wikipedia.org/wiki/Inside_Out_(2015_film)"}),
  Q(600,"من مخرج فيلم «البحث عن نيمو» (Finding Nemo)؟","أندرو ستانتون",["بيت دوكتر","جون لاسيتر","براد بيرد"],None,None,{"flags":["film"],"source":"https://en.wikipedia.org/wiki/Finding_Nemo"}),
 ],
 "marvel":[
  Q(200,"ما اسم شقيق ثور الشرير في عالم مارفل؟","لوكي",["ثانوس","هيلا","أولترون"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Loki_(Marvel_Comics)"}),
  Q(200,"ما الاسم الحقيقي للرجل الأخضر «الهالك»؟","بروس بانر",["ستيف روجرز","بيتر باركر","كلينت بارتون"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Hulk"}),
  Q(400,"ما اسم القلادة السحرية التي يحملها الدكتور ستيفن سترينج؟","عين أغاموتو",["المطرقة","الدرع","القفاز"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Eye_of_Agamotto"}),
  Q(600,"ما اسم القفاز الذي يجمع أحجار اللانهاية في يد ثانوس؟","قفاز اللانهاية",["قفاز الرعد","قفاز الأسد","قفاز الظل"],None,None,{"flags":["film","character"],"source":"https://en.wikipedia.org/wiki/Infinity_Gauntlet"}),
 ],
}
