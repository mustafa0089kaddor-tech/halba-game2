# مخطط قاعدة البيانات (مختصر)

الملف الكامل: `supabase/schema.sql`.

| الجدول | الغرض | أهم الأعمدة |
|---|---|---|
| profiles | ملف المستخدم، يُنشأ تلقائياً عند التسجيل | id, email, role (user/admin), stripe_customer_id |
| categories | الفئات (١٢٠) | slug, name, emoji, color, group_key (المحور), sort, premium, pack_id, sponsor_id, published |
| questions | بنك الأسئلة: عدد كبير لكل مستوى | category_id, points 200/400/600, type, question, answer, options, source, media_url, status (draft/approved) |
| seen_questions | ما رآه اللاعب المسجّل، لتقليل التكرار | user_id, question_id, seen_at |
| category_stats (عرض) | حجم البنك المعتمد لكل فئة ومستوى | category_id, c200, c400, c600, total |
| packs | باقات الدفعة الواحدة | slug, name, price_label, stripe_price_id |
| sponsors | الرعاة | name, logo_url, url, blurb |
| orgs | الشركات والفعاليات | slug (/e/slug), name, logo_url, color |
| games | الألعاب المحفوظة للمسجّلين | user_id, org_id, teams, scores, winner, status |
| subscriptions | حالة اشتراك Stripe | id, user_id, status, current_period_end |
| purchases | الباقات المملوكة | user_id, pack_id |
| payments | سجل الإيرادات للوحة الأدمن | kind, amount, currency, stripe_ref |
| feedback | تقييمات وبلاغات | question_id, kind (report/up/down), reason |

العلاقات: categories ← questions، categories → packs و sponsors، users ← games/subscriptions/purchases/payments/feedback.
الصلاحيات: RLS مفعّل على الكل، والخادم يستخدم service_role. المستخدم يقرأ فقط ملفه وألعابه واشتراكه.
