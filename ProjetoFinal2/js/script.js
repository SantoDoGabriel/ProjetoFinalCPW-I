//DOM 
const track = document.getElementById('carouselTrack');
const prevButton = document.getElementById('prevBtn');
const nextButton = document.getElementById('nextBtn');
const slides = Array.from(track.children);

let currentIndex = 0;

function updateCarouselPosition(){
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

nextButton.addEventListener('click', () => {
    if (currentIndex < slides.lenght - 1){
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    updateCarouselPosition();
})

prevButton.addEventListener('click', () => {
    if(currentIndex > 0){
        currentIndex--;
    } else {
        currentIndex = slides.lenght - 1;
    }
    updateCarouselPosition();
})

setInterval(() => {
    nextButton.click();
}, 5000)