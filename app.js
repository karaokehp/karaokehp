document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const bookingForm = document.getElementById('booking-form');

    // ヘッダースクロールエフェクト
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // フォーム送信
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            // デモ用の送信完了処理
            setTimeout(() => {
                alert('お問い合わせありがとうございます！\n料金やプレオープンの詳細が決まり次第、ご連絡いたします。\n（※これはデモ画面です）');
                bookingForm.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = '送信する';
            }, 1500);
        });
    }
});
