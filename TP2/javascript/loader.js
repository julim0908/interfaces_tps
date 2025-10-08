document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    const loaderPercentage = document.getElementById('loader-percentage');
    const content = document.getElementById('content');
    
    let percentage = 0;
    const duration = 5000;
    const interval = 50;
    const increment = (100 / duration) * interval;
    
    const progressInterval = setInterval(function() {
        percentage += increment;
        
        if (percentage >= 100) {
            percentage = 100;
            loaderPercentage.textContent = '100%';
            

            setTimeout(function() {
                loader.style.display = 'none';
                content.style.display = 'block';
            }, 300);
            
            clearInterval(progressInterval);
        } else {
            loaderPercentage.textContent = Math.floor(percentage) + '%';
        }
    }, interval);
});