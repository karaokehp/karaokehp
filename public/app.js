/**
 * カラオケ・米糠風呂 ナイアス（神様の道具 コガマ）
 * メインスクリプト
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. ヘッダースクロール監視
    // -------------------------------------------------------------------------
    const header = document.getElementById('main-header');
    const handleScroll = () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // -------------------------------------------------------------------------
    // 2. モバイルハンバーガーメニュー
    // -------------------------------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // リンククリック時にメニューを閉じる
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // -------------------------------------------------------------------------
    // 3. 料金ポスター拡大モーダル
    // -------------------------------------------------------------------------
    const openPosterBtn = document.getElementById('open-poster-modal');
    const closePosterBtn = document.getElementById('close-poster-modal');
    const posterModal = document.getElementById('poster-modal');

    const openModal = () => {
        if (posterModal) {
            posterModal.classList.add('open');
            posterModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeModal = () => {
        if (posterModal) {
            posterModal.classList.remove('open');
            posterModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    if (openPosterBtn) openPosterBtn.addEventListener('click', openModal);
    if (closePosterBtn) closePosterBtn.addEventListener('click', closeModal);

    if (posterModal) {
        posterModal.addEventListener('click', (e) => {
            if (e.target === posterModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && posterModal && posterModal.classList.contains('open')) {
            closeModal();
        }
    });

    // -------------------------------------------------------------------------
    // 4. リアルタイム料金シミュレーター
    // -------------------------------------------------------------------------
    const calcTimeDay = document.getElementById('calc-time-day');
    const calcTimeNight = document.getElementById('calc-time-night');
    const radioDayLabel = document.getElementById('radio-day-label');
    const radioNightLabel = document.getElementById('radio-night-label');
    const adultRateHint = document.getElementById('adult-rate-hint');

    const calcHoursInput = document.getElementById('calc-hours');
    const calcHoursDisplay = document.getElementById('calc-hours-display');

    const calcAdultsInput = document.getElementById('calc-adults');
    const calcSeniorsInput = document.getElementById('calc-seniors');
    const calcKidsInput = document.getElementById('calc-kids');
    const calcInfantsInput = document.getElementById('calc-infants');

    const resultTotalPrice = document.getElementById('result-total-price');
    const resultPerPerson = document.getElementById('result-per-person');
    const resultPerPersonWrap = document.getElementById('result-per-person-wrap');

    const bdTimeframe = document.getElementById('bd-timeframe');
    const bdHours = document.getElementById('bd-hours');
    const bdPeople = document.getElementById('bd-people');
    const bdRule = document.getElementById('bd-rule');

    // 計算関数
    function calculateTotal() {
        const isDay = calcTimeDay ? calcTimeDay.checked : true;
        const hours = parseInt(calcHoursInput?.value || '2', 10);
        const adults = parseInt(calcAdultsInput?.value || '0', 10);
        const seniors = parseInt(calcSeniorsInput?.value || '0', 10);
        const kids = parseInt(calcKidsInput?.value || '0', 10);
        const infants = parseInt(calcInfantsInput?.value || '0', 10);

        // 表示用利用時間
        if (calcHoursDisplay) {
            calcHoursDisplay.textContent = `${hours}時間`;
        }

        // ラジオボタンアクティブクラス切り替え
        if (radioDayLabel && radioNightLabel) {
            if (isDay) {
                radioDayLabel.classList.add('active');
                radioNightLabel.classList.remove('active');
                if (adultRateHint) adultRateHint.textContent = '昼 400円 / 1人・1h（3名以上時）';
            } else {
                radioNightLabel.classList.add('active');
                radioDayLabel.classList.remove('active');
                if (adultRateHint) adultRateHint.textContent = '夜 500円 / 1人・1h（3名以上時）';
            }
        }

        // 有効人数（未就学児は室料無料）
        const payingPeople = adults + seniors + kids;
        const totalPeople = payingPeople + infants;

        let hourlyCost = 0;
        let appliedRule = '';

        if (payingPeople <= 0 && infants > 0) {
            // 未就学児のみは保護者同伴が通常必要だがシミュレーション上0円
            hourlyCost = 0;
            appliedRule = '未就学児のみ（室料無料）';
        } else if (payingPeople <= 2) {
            // 2名様までの一律一室料金
            // 昼：1,000円 / 室 / 1h
            // 夜：1,500円 / 室 / 1h
            const baseRoomRate = isDay ? 1000 : 1500;
            
            // 割引の適用：
            // シニア割引（1時間100円引き）
            // 小学生半額（一般料金基準の差額引き）
            const seniorDiscount = seniors * 100;
            const singleAdultRate = isDay ? 400 : 500;
            const kidDiscount = kids * (singleAdultRate * 0.5);

            hourlyCost = Math.max(0, baseRoomRate - seniorDiscount - kidDiscount);
            appliedRule = isDay 
                ? '昼の一律一室料金（1室1,000円）適用' 
                : '夜の1組限定一室貸切料金（1室1,500円）適用';
            
            if (seniors > 0 || kids > 0) {
                appliedRule += '（優待割引反映済）';
            }
        } else {
            // 3名様以上の個別料金計算
            // 昼：大人400円、シニア300円、小学生200円
            // 夜：大人500円、シニア400円、小学生250円
            const adultRate = isDay ? 400 : 500;
            const seniorRate = isDay ? 300 : 400; // 100円引き
            const kidRate = isDay ? 200 : 250;    // 半額

            hourlyCost = (adults * adultRate) + (seniors * seniorRate) + (kids * kidRate);
            appliedRule = isDay
                ? '昼の個別料金制（1人400円〜）適用'
                : '夜の個別料金制（1人500円〜）適用';
        }

        const totalCost = Math.round(hourlyCost * hours);

        // 結果反映
        if (resultTotalPrice) {
            resultTotalPrice.textContent = totalCost.toLocaleString();
        }

        if (resultPerPerson && resultPerPersonWrap) {
            const countForAverage = payingPeople > 0 ? payingPeople : totalPeople;
            if (countForAverage > 0) {
                const perPersonCost = Math.round(totalCost / countForAverage);
                resultPerPerson.textContent = perPersonCost.toLocaleString();
                resultPerPersonWrap.style.display = 'inline-block';
            } else {
                resultPerPersonWrap.style.display = 'none';
            }
        }

        if (bdTimeframe) {
            bdTimeframe.textContent = isDay ? '昼の部（9:00〜18:00）' : '夜の部（18:00〜22:00 / 貸切）';
        }
        if (bdHours) {
            bdHours.textContent = `${hours} 時間`;
        }
        if (bdPeople) {
            const parts = [];
            if (adults > 0) parts.push(`大人${adults}`);
            if (seniors > 0) parts.push(`シニア${seniors}`);
            if (kids > 0) parts.push(`小学生${kids}`);
            if (infants > 0) parts.push(`未就学${infants}`);
            bdPeople.textContent = `${totalPeople} 名様（${parts.join('・') || '0'}）`;
        }
        if (bdRule) {
            bdRule.textContent = appliedRule;
        }
    }

    // カウンターボタンイベントリスナー
    const counterButtons = document.querySelectorAll('.btn-counter');
    counterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const action = btn.getAttribute('data-action');
            const input = document.getElementById(targetId);
            if (!input) return;

            let val = parseInt(input.value || '0', 10);
            const min = parseInt(input.getAttribute('min') || '0', 10);
            const max = parseInt(input.getAttribute('max') || '20', 10);

            if (action === 'plus') {
                if (val < max) val++;
            } else if (action === 'minus') {
                if (val > min) val--;
            }

            input.value = val;
            calculateTotal();
        });
    });

    // 時間スライダーリスナー
    if (calcHoursInput) {
        calcHoursInput.addEventListener('input', calculateTotal);
    }

    // 時間帯ラジオリスナー
    if (calcTimeDay) calcTimeDay.addEventListener('change', calculateTotal);
    if (calcTimeNight) calcTimeNight.addEventListener('change', calculateTotal);

    // 初回計算実行
    calculateTotal();
});
