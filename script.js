/**
 * BS BINMAP - Application Script (Updated Sidebar Proportions & Empty State Text)
 */

document.addEventListener("DOMContentLoaded", () => {
    initMap();
});

function initMap() {
    const imageUrl = "assets/BSMAP.jpg";
    let tempLatLng = null;    
    let isAddMode = false;    

    const map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomControl: false,
        attributionControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    function createCustomIcon(type) {
        let color = "#1976D2"; 
        if (type === "ขยะเปียก") color = "#2E7D32";   
        if (type === "ขยะรีไซเคิล") color = "#FBC02D"; 
        if (type === "ขยะอันตราย") color = "#D32F2F";  

        return L.divIcon({
            className: "custom-bin-marker-inner", 
            html: `
            <div class="custom-bin-marker-wrapper" style="width: 22px; height: 30px; position: relative;">
                <div style="width: 22px; height: 22px; background: ${color}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.2); position: relative;">
                    <div style="position: absolute; left: 50%; bottom: -9px; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
                </div>
            </div>`,
            iconSize: [22, 30],
            iconAnchor: [11, 30]
        });
    }

    const img = new Image();
    img.src = imageUrl;

    img.onload = function () {
        const w = this.naturalWidth;
        const h = this.naturalHeight;
        const bounds = [[0, 0], [h, w]];

        const imageOverlay = L.imageOverlay(imageUrl, bounds).addTo(map);

// ให้รูปพอดีกับหน้าจอ
map.fitBounds(bounds, {
    padding: [0, 0],
    animate: false
});

// คำนวณ Zoom ที่พอดี
const fitZoom = map.getBoundsZoom(bounds);

// ล็อกไม่ให้ Zoom ออกจนรูปเล็ก
map.setMinZoom(fitZoom);

// ใช้ Zoom ที่คำนวณได้
map.setZoom(map.getZoom() + 0.49);

// จำกัดการลากออกนอกแผนที่
map.setMaxBounds(bounds);

// รีเฟรชหลังโหลดเสร็จ
setTimeout(() => {
    map.invalidateSize();
    map.fitBounds(bounds, {
        padding: [0, 0],
        animate: false
    });
}, 100);

        // ฟังก์ชันอัปเดตหรือตรวจสอบกรณีไม่มีคอมเมนต์
        function checkEmptyComments() {
            const commentsDiv = document.getElementById("binComments");
            // ถ้าไม่มีลูกอยู่เลย หรือมีแต่ข้อความว่างเปล่า ให้ใส่ข้อความเริ่มต้น
            if (commentsDiv.children.length === 0) {
                commentsDiv.innerHTML = `<div class="empty-comment-placeholder">ยังไม่มีความคิดเห็น</div>`;
            }
        }

        function bindMarkerEvents(marker, data) {
            marker.on("click", (e) => {
                L.DomEvent.stopPropagation(e); 

                exitAddMode();

                document.getElementById("sidebarPlaceholder").style.display = "none";
                document.getElementById("sidebarContent").style.display = "flex";

                document.getElementById("binTitle").textContent = data.title;
                document.getElementById("binType").textContent = data.type;
                document.getElementById("binColor").textContent = data.color;
                document.getElementById("binLocation").textContent = data.location;
                document.getElementById("binUpdate").textContent = data.update;
                document.getElementById("binImage").src = data.image;

                // 🌟 เคลียร์ค่าเริ่มต้น และเรียกฟังก์ชันใส่คำว่า "ยังไม่มีความคิดเห็น"
                document.getElementById("binComments").innerHTML = ``;
                checkEmptyComments();
            });
        }


        // ===================================================
        // 🔄 ฟังก์ชัน จัดการสถานะโหมดเพิ่มถังขยะ
        // ===================================================
        const modeBtn = document.getElementById("addBinModeBtn");

        function exitAddMode() {
            isAddMode = false;
            modeBtn.classList.remove("active");
            modeBtn.querySelector("span").textContent = "เพิ่มถังขยะ";
            document.getElementById("addBinModal").style.display = "none";
        }

        modeBtn.addEventListener("click", () => {
            isAddMode = !isAddMode; 

            if (isAddMode) {
                modeBtn.classList.add("active");
                modeBtn.querySelector("span").textContent = "ปิดโหมดเพิ่ม";
                alert("เปิดโหมดเพิ่มถังขยะแล้ว: กรุณาคลิก 1 ครั้งบนจุดที่ต้องการในแผนที่");
            } else {
                exitAddMode();
            }
        });


        // ===================================================
        // 📍 EVENT: คลิกบนแผนที่ -> เปิดหน้าต่างลอย (Modal)
        // ===================================================
        map.on("click", (e) => {
            if (!isAddMode) return; 

            tempLatLng = e.latlng; 

            document.getElementById("addBinModal").style.display = "flex";
            document.getElementById("newBinLocation").value = "";
        });


        // ===================================================
        // 💾 EVENT: ปุ่มบันทึกข้อมูลถังขยะใหม่ในหน้าต่างลอย
        // ===================================================
        document.getElementById("saveBinBtn").addEventListener("click", () => {
            const type = document.getElementById("newBinType").value;
            const locationInput = document.getElementById("newBinLocation").value.trim();

            if (!locationInput) {
                alert("กรุณากรอกคำอธิบายสถานที่ตั้งด้วยครับ");
                return;
            }

            const autoTitle = `จุดทิ้ง${type}`; 

            let colorEmoji = "🔵 ";
            let colorText = "สีน้ำเงิน";
            if (type === "ขยะเปียก") { colorEmoji = "🟢 "; colorText = "สีเขียว"; }
            if (type === "ขยะรีไซเคิล") { colorEmoji = "🟡 "; colorText = "สีเหลือง"; }
            if (type === "ขยะทั่วไป") { colorEmoji = "🔵 "; colorText = "สีน้ำเงิน"; }
            if (type === "ขยะอันตราย") { colorEmoji = "🔴 "; colorText = "สีแดง"; }

            let defaultImg = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=500&q=80";
            if (type === "ขยะเปียก") defaultImg = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=500&q=80";

            const newBinData = {
                title: autoTitle, 
                type: type,
                color: colorEmoji + colorText,
                location: locationInput,
                update: "วันนี้ (โดยผู้ใช้)",
                image: defaultImg
            };

            const newMarker = L.marker(tempLatLng, { icon: createCustomIcon(type) }).addTo(map);
            bindMarkerEvents(newMarker, newBinData);

            exitAddMode();
            tempLatLng = null; 
            newMarker.fire("click"); 
        });


        // ===================================================
        // EVENT: กลุ่มปุ่มปิดหน้าต่างต่างๆ
        // ===================================================
        document.querySelector(".close-sidebar-btn").addEventListener("click", () => {
            document.getElementById("sidebarContent").style.display = "none";
            document.getElementById("sidebarPlaceholder").style.display = "flex";
        });

        document.getElementById("closeModalBtn").addEventListener("click", () => {
            exitAddMode();
        });


        // ===================================================
        // EVENT: พิมพ์ส่งคอมเมนต์ในกล่องแชทหลัก
        // ===================================================
        const submitBtn = document.querySelector(".submit-report-btn");
        const reportInput = document.querySelector(".report-input");

        if (submitBtn && reportInput) {
            submitBtn.addEventListener("click", () => {
                const text = reportInput.value.trim();
                if (text === "") return;

                const commentsDiv = document.getElementById("binComments");
                
                // 🌟 หากมีกล่องข้อความว่าง "ยังไม่มีความคิดเห็น" อยู่ ให้ลบออกก่อนเพิ่มคอมเมนต์แรก
                const placeholder = commentsDiv.querySelector(".empty-comment-placeholder");
                if (placeholder) {
                    commentsDiv.innerHTML = "";
                }

                const newComment = document.createElement("div");
                newComment.className = "comment-card";
                
                newComment.innerHTML = `
                    <div style="width: 26px; height: 26px; background: #cbd5e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; shrink: 0; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; color: white;">
                            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="comment-main">
                        <div class="comment-user-info"><span class="username">คุณ (ผู้ใช้)</span><span class="comment-time">เมื่อสักครู่</span></div>
                        <span class="comment-text">${text}</span>
                    </div>`;

                commentsDiv.appendChild(newComment);
                reportInput.value = "";
                commentsDiv.scrollTop = commentsDiv.scrollHeight;
            });

            reportInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") submitBtn.click();
            });
        }
    };
}