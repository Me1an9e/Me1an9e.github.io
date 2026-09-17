document.addEventListener('DOMContentLoaded', function () {

	// ==========================================
	// 1. スライドショー処理
	// ==========================================
	const slideshowContainer = document.querySelector('.slideshow-container');

	if (slideshowContainer) {
		const slideWrapper = slideshowContainer.querySelector('.slide-wrapper');
		const slides = slideshowContainer.querySelectorAll('.slide');
		const paginationDots = document.querySelectorAll('.pagination-dot');
		const originalSlidesCount = 4;
		const slideInterval = 3000;

		let currentIndex = 0;
		let autoSlideTimer;
		let singleSlideTotalWidth = 0;
		let containerWidth = 0;

		function initializeSlideDimensions() {
			if (slides.length > 0) {
				const slideWidth = slides[0].offsetWidth;
				const style = window.getComputedStyle(slides[0]);
				const slideMarginRight = parseFloat(style.marginRight);
				const slideMarginLeft = parseFloat(style.marginLeft);
				singleSlideTotalWidth = slideWidth + slideMarginLeft + slideMarginRight;
			}
			containerWidth = slideshowContainer.offsetWidth;
		}

		function setupInfiniteScroll() {
			if (slides.length > 0) {
				const firstSlide = slides[0];
				const lastSlide = slides[originalSlidesCount - 1];

				slideWrapper.insertBefore(lastSlide.cloneNode(true), firstSlide);
				slideWrapper.appendChild(firstSlide.cloneNode(true));

				currentIndex = 1;
				goToSlide(currentIndex, false);
			}
		}

		function calculateSlideOffset(index) {
			return (containerWidth / 2) - (singleSlideTotalWidth / 2) - (index * singleSlideTotalWidth);
		}

		function goToSlide(index, smoothTransition = true) {
			if (smoothTransition) {
				slideWrapper.style.transition = 'transform 0.5s ease-in-out';
			} else {
				slideWrapper.style.transition = 'none';
			}

			currentIndex = index;
			slideWrapper.style.transform = `translateX(${calculateSlideOffset(currentIndex)}px)`;

			// クローン到達時のシームレス移動（チラつき防止）
			if (currentIndex === originalSlidesCount + 1) {
				slideWrapper.addEventListener('transitionend', function handler() {
					slideWrapper.removeEventListener('transitionend', handler);
					slideWrapper.style.transition = 'none';
					currentIndex = 1;
					slideWrapper.style.transform = `translateX(${calculateSlideOffset(currentIndex)}px)`;
					slideWrapper.offsetHeight; // 強制リフローで位置を即座に確定
					updatePaginationDots();
				});
			} else if (currentIndex === 0) {
				slideWrapper.addEventListener('transitionend', function handler() {
					slideWrapper.removeEventListener('transitionend', handler);
					slideWrapper.style.transition = 'none';
					currentIndex = originalSlidesCount;
					slideWrapper.style.transform = `translateX(${calculateSlideOffset(currentIndex)}px)`;
					slideWrapper.offsetHeight;
					updatePaginationDots();
				});
			} else {
				updatePaginationDots();
			}
		}

		function nextSlide() {
			goToSlide(currentIndex + 1);
		}

		function updatePaginationDots() {
			let activeDotIndex = currentIndex - 1;
			if (activeDotIndex === -1) {
				activeDotIndex = originalSlidesCount - 1;
			} else if (activeDotIndex === originalSlidesCount) {
				activeDotIndex = 0;
			}

			paginationDots.forEach((dot, idx) => {
				dot.classList.toggle('active', idx === activeDotIndex);
			});
		}

		paginationDots.forEach(dot => {
			dot.addEventListener('click', function () {
				clearInterval(autoSlideTimer);
				const slideIndex = parseInt(this.dataset.slideIndex) + 1;
				goToSlide(slideIndex, true);
				autoSlideTimer = setInterval(nextSlide, slideInterval);
			});
		});

		// 初期化と起動
		initializeSlideDimensions();
		setupInfiniteScroll();
		window.addEventListener('resize', initializeSlideDimensions);
		autoSlideTimer = setInterval(nextSlide, slideInterval);
	}

	// ==========================================
	// 2. スクロールアニメーション＆ロゴ制御
	// ==========================================
	const logoContainer = document.querySelector('.logo-container');
	const categoryDetails = document.querySelector('.category-details');
	const body = document.body;

	const logoHideScroll = 550;
	const categoryShowScroll = 200;
	const changeBgThreshold = 50;

	let ticking = false;

	function updateScrollAnimations() {
		const scrollY = window.scrollY;

		// ロゴの拡大・フェードアウト
		if (logoContainer) {
			if (scrollY <= logoHideScroll) {
				const opacity = 1 - (scrollY / logoHideScroll);
				const scale = 1 + (scrollY / 65);
				logoContainer.style.opacity = opacity;
				logoContainer.style.transform = `scale(${scale})`;
				logoContainer.style.pointerEvents = 'auto';
			} else {
				logoContainer.style.opacity = 0;
				logoContainer.style.pointerEvents = 'none';
			}
		}

		// カテゴリ詳細
		if (categoryDetails) {
			if (scrollY >= categoryShowScroll) {
				const categoryOpacity = Math.min(1, (scrollY - categoryShowScroll) / (logoHideScroll - categoryShowScroll));
				categoryDetails.style.opacity = categoryOpacity;
			} else {
				categoryDetails.style.opacity = 0;
			}
		}

		// 背景色
		if (body) {
			body.style.backgroundColor = scrollY > changeBgThreshold ? '#f0f0f0' : '#fff';
		}

		ticking = false;
	}

	window.addEventListener('scroll', function () {
		if (!ticking) {
			window.requestAnimationFrame(updateScrollAnimations);
			ticking = true;
		}
	});

	// 初期表示時にも一回実行
	updateScrollAnimations();

	// ==========================================
	// 3. ハンバーガーメニュー
	// ==========================================
	const hamburgerMenu = document.querySelector('.hamburger-menu');
	const navMenu = document.querySelector('.nav-menu');

	if (hamburgerMenu && navMenu) {
		hamburgerMenu.addEventListener('click', function () {
			hamburgerMenu.classList.toggle('open');
			navMenu.classList.toggle('open');

			if (navMenu.classList.contains('open')) {
				if (logoContainer) {
					logoContainer.style.opacity = 0;
					logoContainer.style.pointerEvents = 'none';
				}
			} else {
				// 閉じた時は共通のスクロール関数を呼ぶだけ！
				updateScrollAnimations();
			}
		});

		const navLinks = document.querySelectorAll('.nav-menu a');
		navLinks.forEach(link => {
			link.addEventListener('click', function () {
				hamburgerMenu.classList.remove('open');
				navMenu.classList.remove('open');
				updateScrollAnimations();
			});
		});
	}

});