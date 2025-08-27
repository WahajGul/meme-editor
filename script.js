class MemeEditor {
    constructor() {
        this.currentTemplate = 'assets/img01.jpg';
        this.selectedTextElement = 'topText';
        this.textCounter = 2; // For creating unique IDs for new text elements
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.currentDragElement = null;
        this.potentialDragElement = null;
        this.initialMousePos = null;
        this.mouseDownTime = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateFontSizeDisplay();
        this.updateStrokeWidthDisplay();
    }

    bindEvents() {
        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectTemplate(e));
        });

        // Text element selection
        document.querySelectorAll('.text-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTextElement(e));
        });

        // Font controls
        document.getElementById('fontFamily').addEventListener('change', (e) => this.updateFontFamily(e));
        document.getElementById('fontSize').addEventListener('input', (e) => this.updateFontSize(e));
        document.getElementById('textColor').addEventListener('input', (e) => this.updateTextColor(e));
        document.getElementById('strokeColor').addEventListener('input', (e) => this.updateStrokeColor(e));
        document.getElementById('strokeWidth').addEventListener('input', (e) => this.updateStrokeWidth(e));
        document.getElementById('textAlign').addEventListener('change', (e) => this.updateTextAlign(e));

        // Style buttons
        document.getElementById('boldBtn').addEventListener('click', () => this.toggleBold());
        document.getElementById('italicBtn').addEventListener('click', () => this.toggleItalic());
        document.getElementById('uppercaseBtn').addEventListener('click', () => this.toggleUppercase());

        // Action buttons
        document.getElementById('addTextBtn').addEventListener('click', () => this.addNewText());
        document.getElementById('removeTextBtn').addEventListener('click', () => this.removeCurrentText());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadMeme());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetMeme());

        // Text overlay click events for selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('text-overlay')) {
                this.selectTextFromCanvas(e.target.id);
            }
        });

        // Drag functionality for text overlays
        this.initDragFunctionality();

        // Prevent text overlays from losing focus when clicking controls
        document.querySelectorAll('.text-overlay').forEach(element => {
            element.addEventListener('blur', () => {
                // Save content when losing focus
                this.saveTextContent(element);
            });
        });
    }

    selectTemplate(e) {
        // Remove active class from all templates
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked template
        e.currentTarget.classList.add('active');
        
        // Update template image
        const templatePath = e.currentTarget.dataset.template;
        this.currentTemplate = templatePath;
        document.getElementById('templateImage').src = templatePath;
    }

    selectTextElement(e) {
        // Remove active class from all text buttons
        document.querySelectorAll('.text-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        e.currentTarget.classList.add('active');
        
        // Update selected text element
        this.selectedTextElement = e.currentTarget.dataset.target;
        this.loadCurrentTextStyles();
    }

    selectTextFromCanvas(elementId) {
        // Update text button selection
        document.querySelectorAll('.text-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.target === elementId) {
                btn.classList.add('active');
            }
        });
        
        this.selectedTextElement = elementId;
        this.loadCurrentTextStyles();
    }

    loadCurrentTextStyles() {
        const element = document.getElementById(this.selectedTextElement);
        if (!element) return;

        const styles = window.getComputedStyle(element);
        
        // Update controls to match current element styles
        document.getElementById('fontFamily').value = element.style.fontFamily || 'Impact';
        document.getElementById('fontSize').value = parseInt(element.style.fontSize) || 32;
        document.getElementById('textColor').value = this.rgbToHex(element.style.color) || '#ffffff';
        document.getElementById('strokeColor').value = this.rgbToHex(element.style.webkitTextStrokeColor) || '#000000';
        document.getElementById('strokeWidth').value = parseFloat(element.style.webkitTextStrokeWidth) || 2;
        document.getElementById('textAlign').value = element.style.textAlign || 'center';
        
        this.updateFontSizeDisplay();
        this.updateStrokeWidthDisplay();
        this.updateStyleButtons();
    }

    updateFontFamily(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.fontFamily = e.target.value;
        }
    }

    updateFontSize(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.fontSize = e.target.value + 'px';
        }
        this.updateFontSizeDisplay();
    }

    updateTextColor(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.color = e.target.value;
        }
    }

    updateStrokeColor(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.webkitTextStrokeColor = e.target.value;
        }
    }

    updateStrokeWidth(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.webkitTextStrokeWidth = e.target.value + 'px';
        }
        this.updateStrokeWidthDisplay();
    }

    updateTextAlign(e) {
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.style.textAlign = e.target.value;
        }
    }

    toggleBold() {
        const element = document.getElementById(this.selectedTextElement);
        const btn = document.getElementById('boldBtn');
        
        if (element) {
            const currentWeight = element.style.fontWeight;
            if (currentWeight === 'bold' || currentWeight === '700') {
                element.style.fontWeight = 'normal';
                btn.classList.remove('active');
            } else {
                element.style.fontWeight = 'bold';
                btn.classList.add('active');
            }
        }
    }

    toggleItalic() {
        const element = document.getElementById(this.selectedTextElement);
        const btn = document.getElementById('italicBtn');
        
        if (element) {
            const currentStyle = element.style.fontStyle;
            if (currentStyle === 'italic') {
                element.style.fontStyle = 'normal';
                btn.classList.remove('active');
            } else {
                element.style.fontStyle = 'italic';
                btn.classList.add('active');
            }
        }
    }

    toggleUppercase() {
        const element = document.getElementById(this.selectedTextElement);
        const btn = document.getElementById('uppercaseBtn');
        
        if (element) {
            const currentTransform = element.style.textTransform;
            if (currentTransform === 'uppercase') {
                element.style.textTransform = 'none';
                btn.classList.remove('active');
            } else {
                element.style.textTransform = 'uppercase';
                btn.classList.add('active');
            }
        }
    }

    addNewText() {
        this.textCounter++;
        const newTextId = `text${this.textCounter}`;
        
        // Create new text element
        const newTextElement = document.createElement('div');
        newTextElement.className = 'text-overlay';
        newTextElement.id = newTextId;
        newTextElement.contentEditable = 'true';
        newTextElement.textContent = 'NEW TEXT';
        newTextElement.style.top = '50%';
        newTextElement.style.left = '50%';
        newTextElement.style.transform = 'translate(-50%, -50%)';
        
        // Apply default styles
        newTextElement.style.fontFamily = 'Impact';
        newTextElement.style.fontSize = '32px';
        newTextElement.style.color = '#ffffff';
        newTextElement.style.webkitTextStrokeWidth = '2px';
        newTextElement.style.webkitTextStrokeColor = '#000000';
        newTextElement.style.textAlign = 'center';
        
        // Add to canvas
        document.getElementById('memeCanvas').appendChild(newTextElement);
        
        // Create new text button
        const newTextBtn = document.createElement('button');
        newTextBtn.className = 'text-btn';
        newTextBtn.dataset.target = newTextId;
        newTextBtn.textContent = `Text ${this.textCounter}`;
        newTextBtn.addEventListener('click', (e) => this.selectTextElement(e));
        
        // Add to text selector
        document.querySelector('.text-selector').appendChild(newTextBtn);
        
        // Select the new text element
        this.selectTextFromCanvas(newTextId);
        
        // Add click event for canvas selection
        newTextElement.addEventListener('click', (e) => {
            this.selectTextFromCanvas(e.target.id);
        });
        
        // Add blur event for saving content
        newTextElement.addEventListener('blur', () => {
            this.saveTextContent(newTextElement);
        });
    }

    removeCurrentText() {
        // Don't remove if it's one of the default texts and it's the only one
        const textElements = document.querySelectorAll('.text-overlay');
        if (textElements.length <= 1) {
            alert('You must have at least one text element!');
            return;
        }
        
        // Remove the text element
        const element = document.getElementById(this.selectedTextElement);
        if (element) {
            element.remove();
        }
        
        // Remove the corresponding button
        const btn = document.querySelector(`[data-target="${this.selectedTextElement}"]`);
        if (btn) {
            btn.remove();
        }
        
        // Select the first remaining text element
        const remainingButtons = document.querySelectorAll('.text-btn');
        if (remainingButtons.length > 0) {
            remainingButtons[0].click();
        }
    }

    saveTextContent(element) {
        // This method can be extended to save content if needed
        console.log(`Saved content for ${element.id}: ${element.textContent}`);
    }

    downloadMeme() {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.getElementById('templateImage');
        
        // Wait for image to load if it hasn't already
        const processDownload = () => {
            // Set canvas size to match image
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            
            // Draw the template image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Get all text overlays
            const textElements = document.querySelectorAll('.text-overlay');
            
            textElements.forEach(textElement => {
                const text = textElement.textContent.trim();
                if (!text) return;
                
                // Get computed styles
                const styles = window.getComputedStyle(textElement);
                const fontSize = parseInt(textElement.style.fontSize) || 32;
                const fontFamily = textElement.style.fontFamily || 'Impact';
                const color = textElement.style.color || '#ffffff';
                const strokeColor = textElement.style.webkitTextStrokeColor || '#000000';
                const strokeWidth = parseFloat(textElement.style.webkitTextStrokeWidth) || 2;
                const textAlign = textElement.style.textAlign || 'center';
                const fontWeight = textElement.style.fontWeight === 'bold' ? 'bold' : 'normal';
                const fontStyle = textElement.style.fontStyle || 'normal';
                const textTransform = textElement.style.textTransform || 'none';
                
                // Apply text transform
                let displayText = text;
                if (textTransform === 'uppercase') {
                    displayText = text.toUpperCase();
                }
                
                // Calculate position
                const rect = textElement.getBoundingClientRect();
                const canvasRect = document.getElementById('memeCanvas').getBoundingClientRect();
                const x = (rect.left - canvasRect.left) / canvasRect.width * canvas.width;
                const y = (rect.top - canvasRect.top + rect.height/2) / canvasRect.height * canvas.height;
                
                // Scale font size
                const scaledFontSize = fontSize * (canvas.width / canvasRect.width);
                
                // Set font
                ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${fontFamily}`;
                ctx.textAlign = textAlign;
                ctx.textBaseline = 'middle';
                
                // Draw text with stroke
                if (strokeWidth > 0) {
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = strokeWidth * (canvas.width / canvasRect.width);
                    ctx.strokeText(displayText, x, y);
                }
                
                // Draw filled text
                ctx.fillStyle = color;
                ctx.fillText(displayText, x, y);
            });
            
            // Download the canvas as image
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meme_${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        };
        
        if (img.complete) {
            processDownload();
        } else {
            img.onload = processDownload;
        }
    }

    resetMeme() {
        if (confirm('Are you sure you want to reset the meme? This will clear all text.')) {
            // Reset all text elements to default
            document.getElementById('topText').textContent = 'TOP TEXT';
            document.getElementById('bottomText').textContent = 'BOTTOM TEXT';
            
            // Remove any additional text elements
            const extraTexts = document.querySelectorAll('.text-overlay:not(#topText):not(#bottomText)');
            extraTexts.forEach(element => element.remove());
            
            // Remove extra text buttons
            const extraBtns = document.querySelectorAll('.text-btn:not([data-target="topText"]):not([data-target="bottomText"])');
            extraBtns.forEach(btn => btn.remove());
            
            // Reset to first template
            document.querySelector('.template-item').click();
            
            // Reset to top text selection
            document.querySelector('[data-target="topText"]').click();
            
            // Reset counter
            this.textCounter = 2;
            
            // Reset all styles to default
            this.resetTextStyles();
        }
    }

    resetTextStyles() {
        const textElements = document.querySelectorAll('.text-overlay');
        textElements.forEach(element => {
            element.style.fontFamily = 'Impact';
            element.style.fontSize = '32px';
            element.style.color = '#ffffff';
            element.style.webkitTextStrokeWidth = '2px';
            element.style.webkitTextStrokeColor = '#000000';
            element.style.textAlign = 'center';
            element.style.fontWeight = 'bold';
            element.style.fontStyle = 'normal';
            element.style.textTransform = 'uppercase';
        });
        
        // Reset form controls
        document.getElementById('fontFamily').value = 'Impact';
        document.getElementById('fontSize').value = 32;
        document.getElementById('textColor').value = '#ffffff';
        document.getElementById('strokeColor').value = '#000000';
        document.getElementById('strokeWidth').value = 2;
        document.getElementById('textAlign').value = 'center';
        
        this.updateFontSizeDisplay();
        this.updateStrokeWidthDisplay();
        this.updateStyleButtons();
    }

    updateFontSizeDisplay() {
        const value = document.getElementById('fontSize').value;
        document.getElementById('fontSizeValue').textContent = value + 'px';
    }

    updateStrokeWidthDisplay() {
        const value = document.getElementById('strokeWidth').value;
        document.getElementById('strokeWidthValue').textContent = value + 'px';
    }

    updateStyleButtons() {
        const element = document.getElementById(this.selectedTextElement);
        if (!element) return;
        
        // Update bold button
        const boldBtn = document.getElementById('boldBtn');
        const fontWeight = element.style.fontWeight;
        if (fontWeight === 'bold' || fontWeight === '700') {
            boldBtn.classList.add('active');
        } else {
            boldBtn.classList.remove('active');
        }
        
        // Update italic button
        const italicBtn = document.getElementById('italicBtn');
        const fontStyle = element.style.fontStyle;
        if (fontStyle === 'italic') {
            italicBtn.classList.add('active');
        } else {
            italicBtn.classList.remove('active');
        }
        
        // Update uppercase button
        const uppercaseBtn = document.getElementById('uppercaseBtn');
        const textTransform = element.style.textTransform;
        if (textTransform === 'uppercase') {
            uppercaseBtn.classList.add('active');
        } else {
            uppercaseBtn.classList.remove('active');
        }
    }

    initDragFunctionality() {
        // Add drag functionality to all text overlays
        this.setupDragEvents();
        
        // Re-setup drag events when new text is added
        const originalAddNewText = this.addNewText.bind(this);
        this.addNewText = () => {
            originalAddNewText();
            this.setupDragEvents();
        };
    }

    setupDragEvents() {
        const textOverlays = document.querySelectorAll('.text-overlay');
        
        textOverlays.forEach(overlay => {
            // Remove existing event listeners to prevent duplicates
            overlay.removeEventListener('mousedown', this.handleMouseDown);
            overlay.removeEventListener('touchstart', this.handleTouchStart);
            
            // Add new event listeners
            overlay.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            overlay.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        });

        // Add global mouse/touch move and up events
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    handleMouseDown(e) {
        if (e.target.matches('.text-overlay')) {
            // Store initial position for drag detection
            this.initialMousePos = { x: e.clientX, y: e.clientY };
            this.potentialDragElement = e.target;
            this.mouseDownTime = Date.now();
            
            // Don't prevent default here - allow text editing
            // Only prevent if we actually start dragging
        }
    }

    handleTouchStart(e) {
        if (e.target.matches('.text-overlay')) {
            const touch = e.touches[0];
            this.startDrag(e.target, touch.clientX, touch.clientY);
            e.preventDefault();
        }
    }

    startDrag(element, clientX, clientY) {
        this.isDragging = true;
        this.currentDragElement = element;
        
        const rect = element.getBoundingClientRect();
        const canvasRect = document.getElementById('memeCanvas').getBoundingClientRect();
        
        this.dragOffset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        
        element.classList.add('dragging');
        
        // Select this text element
        this.selectTextFromCanvas(element.id);
    }

    handleMouseMove(e) {
        // Check if we should start dragging (if mouse moved enough distance)
        if (this.potentialDragElement && !this.isDragging) {
            const distance = Math.sqrt(
                Math.pow(e.clientX - this.initialMousePos.x, 2) + 
                Math.pow(e.clientY - this.initialMousePos.y, 2)
            );
            
            // Start dragging if moved more than 5 pixels or held for more than 200ms
            const timeDiff = Date.now() - this.mouseDownTime;
            if (distance > 5 || timeDiff > 200) {
                this.startDrag(this.potentialDragElement, this.initialMousePos.x, this.initialMousePos.y);
                e.preventDefault();
            }
        }
        
        if (this.isDragging && this.currentDragElement) {
            this.updateDragPosition(e.clientX, e.clientY);
            e.preventDefault();
        }
    }

    handleTouchMove(e) {
        if (this.isDragging && this.currentDragElement) {
            const touch = e.touches[0];
            this.updateDragPosition(touch.clientX, touch.clientY);
            e.preventDefault();
        }
    }

    updateDragPosition(clientX, clientY) {
        const canvas = document.getElementById('memeCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Calculate new position relative to the canvas
        let newX = clientX - canvasRect.left - this.dragOffset.x;
        let newY = clientY - canvasRect.top - this.dragOffset.y;
        
        // Get element dimensions
        const elementRect = this.currentDragElement.getBoundingClientRect();
        const elementWidth = elementRect.width;
        const elementHeight = elementRect.height;
        
        // Constrain within canvas boundaries
        newX = Math.max(0, Math.min(newX, canvasRect.width - elementWidth));
        newY = Math.max(0, Math.min(newY, canvasRect.height - elementHeight));
        
        // Update position
        this.currentDragElement.style.left = newX + 'px';
        this.currentDragElement.style.top = newY + 'px';
        this.currentDragElement.style.transform = 'none'; // Remove any transform
        this.currentDragElement.style.bottom = 'auto'; // Remove bottom positioning
    }

    handleMouseUp(e) {
        // Clear potential drag state
        this.potentialDragElement = null;
        this.initialMousePos = null;
        this.mouseDownTime = null;
        
        this.endDrag();
    }

    handleTouchEnd(e) {
        this.endDrag();
    }

    endDrag() {
        if (this.isDragging && this.currentDragElement) {
            this.currentDragElement.classList.remove('dragging');
            this.isDragging = false;
            this.currentDragElement = null;
        }
    }

    rgbToHex(rgb) {
        if (!rgb) return null;
        
        const result = rgb.match(/\d+/g);
        if (!result) return null;
        
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

// Initialize the meme editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemeEditor();
});