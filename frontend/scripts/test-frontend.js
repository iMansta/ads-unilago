// Function to test if all required elements are present
function testRequiredElements() {
    const requiredElements = [
        'sidebar',
        'main-content',
        'create-post',
        'posts-feed',
        'right-sidebar'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return false;
    }
    
    console.log('All required elements are present');
    return true;
}

// Function to test if all required styles are loaded
function testRequiredStyles() {
    const requiredStyles = [
        'feed.css',
        'common.css'
    ];

    const styleSheets = Array.from(document.styleSheets);
    const loadedStyles = styleSheets.map(sheet => sheet.href?.split('/').pop());
    
    const missingStyles = requiredStyles.filter(style => !loadedStyles.includes(style));
    
    if (missingStyles.length > 0) {
        console.error('Missing required styles:', missingStyles);
        return false;
    }
    
    console.log('All required styles are loaded');
    return true;
}

// Function to test if all required scripts are loaded
function testRequiredScripts() {
    const requiredScripts = [
        'feed.js',
        'common.js'
    ];

    const scripts = Array.from(document.scripts);
    const loadedScripts = scripts.map(script => script.src?.split('/').pop());
    
    const missingScripts = requiredScripts.filter(script => !loadedScripts.includes(script));
    
    if (missingScripts.length > 0) {
        console.error('Missing required scripts:', missingScripts);
        return false;
    }
    
    console.log('All required scripts are loaded');
    return true;
}

// Run all tests
function runTests() {
    console.log('Running frontend tests...\n');
    
    const elementsTest = testRequiredElements();
    const stylesTest = testRequiredStyles();
    const scriptsTest = testRequiredScripts();
    
    if (elementsTest && stylesTest && scriptsTest) {
        console.log('\nAll frontend tests passed successfully!');
    } else {
        console.error('\nSome frontend tests failed. Please check the errors above.');
    }
}

// Run tests when the page is loaded
window.addEventListener('load', runTests); 