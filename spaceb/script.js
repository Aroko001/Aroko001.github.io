/***** Cookie Utility *****/
setCookie('powerCost', powerCost);
setCookie('auto', auto);
setCookie('autoCost', autoCost);
}


/***** Add Score *****/
function addScore(amount, isManual = false) {
score += amount;
if (isManual) manualClicks++;
scoreEl.textContent = score;
save();


pressBox.classList.add('active');
setTimeout(() => pressBox.classList.remove('active'), 80);
}


/***** Manual Input *****/
document.addEventListener('keydown', e => {
if (e.code === 'Space' && !e.repeat) {
e.preventDefault();
addScore(power, true);
}
});


pressBox.addEventListener('click', () => addScore(power, true));
pressBox.addEventListener('touchstart', e => {
e.preventDefault();
addScore(power, true);
}, { passive: false });


/***** Auto Click *****/
setInterval(() => {
if (auto > 0) {
addScore(auto, false);
}
}, 1000);


/***** Upgrades *****/
powerBtn.onclick = () => {
if (score >= powerCost) {
score -= powerCost;
power++;
powerCost = Math.floor(powerCost * 1.7);
powerCostEl.textContent = powerCost;
scoreEl.textContent = score;
save();
}
};


autoBtn.onclick = () => {
if (score >= autoCost) {
score -= autoCost;
auto++;
autoCost = Math.floor(autoCost * 1.8);
autoCostEl.textContent = autoCost;
scoreEl.textContent = score;
save();
}
};


/***** Reset *****/
resetBtn.onclick = () => {
if (confirm('すべてリセットしますか？')) {
score = 0;
power = 1;
powerCost = 10;
auto = 0;
autoCost = 15;


scoreEl.textContent = score;
powerCostEl.textContent = powerCost;
autoCostEl.textContent = autoCost;
save();
}
};
