const $ = (id) => document.getElementById(id);
const ADMIN_NAME = "khổng tiến anh đẹp trai";
const DB_NAME = "kyyeu_invitation_db";
const DB_STORE = "settings";
const DB_KEY = "site-config";
const ACCOUNT_KEY = "remembered-guest-name";
let currentConfig = { ...CONFIG };
let currentGuestName = "";
let lobbyPreviewObjectUrl = "";
function openConfigDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function loadSavedConfig() {
  try {
    const db = await openConfigDB();
    const saved = await new Promise((resolve, reject) => {
      const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(DB_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (saved) currentConfig = { ...currentConfig, ...saved };
  } catch (error) { console.warn("Không thể đọc cấu hình đã lưu:", error); }
}
async function saveConfigToDB(config) {
  const db = await openConfigDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(config, DB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Lưu bị hủy."));
  });
  db.close();
}

async function getRememberedName() {
  try {
    const db = await openConfigDB();
    const value = await new Promise((resolve, reject) => {
      const req = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(ACCOUNT_KEY);
      req.onsuccess = () => resolve(req.result || ""); req.onerror = () => reject(req.error);
    });
    db.close(); return value;
  } catch (_) { return ""; }
}
async function setRememberedName(name) {
  const db = await openConfigDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    if (name) tx.objectStore(DB_STORE).put(name, ACCOUNT_KEY);
    else tx.objectStore(DB_STORE).delete(ACCOUNT_KEY);
    tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
  });
  db.close();
}
function setLines(id, value) {
  const el = $(id);
  el.replaceChildren();
  String(value || "").split("|").forEach((part, index) => {
    if (index) { const br = document.createElement("br"); const em = document.createElement("em"); em.textContent = part.trim(); el.append(br, em); }
    else el.textContent = part.trim();
  });
}
function applyConfig() {
  document.title = currentConfig.siteTitle || "Thư mời kỷ yếu";
  $("gateEyebrow").textContent = currentConfig.gateEyebrow || "A LITTLE INVITATION";
  setLines("gateTitle", currentConfig.gateTitle);
  $("gateCopy").textContent = currentConfig.gateCopy || "";
  $("gateButton").innerHTML = `${escapeHtml(currentConfig.gateButtonText || "Mở lời mời")} <span>↗</span>`;
  $("gateTinyNote").textContent = currentConfig.gateTinyNote || "";
  $("brandText").innerHTML = `${escapeHtml(currentConfig.brandText || "OUR LITTLE MOMENT")} <i>✳</i>`;
  $("mainEyebrow").textContent = currentConfig.mainEyebrow || "";
  $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${currentGuestName}`.trim();
  setLines("mainTitle", currentConfig.mainTitle);
  $("mainMessage").textContent = currentConfig.mainMessage || "";
  $("eventDate").textContent = currentConfig.eventDate || "";
  $("eventPlace").textContent = currentConfig.eventPlace || "";
  $("footerNote").textContent = currentConfig.footerNote || "";
  $("galleryEyebrow").textContent = currentConfig.galleryEyebrow || "MEMORIES IN FRAMES";
  setLines("galleryTitle", currentConfig.galleryTitle || "Một chút|thanh xuân");
  $("galleryCopy").textContent = currentConfig.galleryCopy || "Những khoảnh khắc mong được cùng bạn viết tiếp.";
  $("confirmTitle").textContent = currentConfig.confirmTitle || "Bạn xác nhận tham gia nhé?";
  $("confirmYes").textContent = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
  $("confirmNo").textContent = currentConfig.confirmNoText || "Để mình suy nghĩ thêm";
  $("confirmNote").textContent = currentConfig.confirmNote || "Email sẽ được soạn sẵn; bạn chỉ cần nhấn Gửi trong ứng dụng email.";
  $("coverImage").src = currentConfig.coverImage || "";
  $("rsvpLink").href = "mailto:" + encodeURIComponent(currentConfig.rsvpEmail || "hello@example.com") + "?subject=" + encodeURIComponent("Xác nhận tham gia chụp kỷ yếu");
  $("rsvpLink").innerHTML = `${escapeHtml(currentConfig.buttonText || "Chấp nhận lời mời")} <span>↗</span>`;
  document.documentElement.style.setProperty("--site-font", `"${currentConfig.fontFamily || "DM Sans"}", sans-serif`);
  document.body.style.backgroundImage = currentConfig.backgroundImage ? `linear-gradient(rgba(251,247,243,.78),rgba(251,247,243,.78)),url("${currentConfig.backgroundImage}")` : "";
  const lobbyImage = currentConfig.lobbyBackgroundImage || "";
  const lobbyOpacity = Math.max(0, Math.min(100, Number(currentConfig.lobbyBackgroundOpacity ?? 35))) / 100;
  document.documentElement.style.setProperty("--lobby-bg-image", lobbyImage ? `url("${lobbyImage}")` : "none");
  document.documentElement.style.setProperty("--lobby-bg-opacity", String(lobbyOpacity));
  $("gallery").innerHTML = (currentConfig.gallery || []).map((item, i) => `<figure class="gallery-item"><img src="${item.image}" alt="Khoảnh khắc kỷ yếu ${i + 1}"><figcaption><span>0${i + 1}</span>${escapeHtml(item.caption)}</figcaption></figure>`).join("");
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fillEditor() {
  $("editSiteTitle").value = currentConfig.siteTitle || "";
  $("editGateEyebrow").value = currentConfig.gateEyebrow || "";
  $("editGateTitle").value = currentConfig.gateTitle || "";
  $("editGateCopy").value = currentConfig.gateCopy || "";
  $("editGateButton").value = currentConfig.gateButtonText || "Mở lời mời";
  $("editGateTinyNote").value = currentConfig.gateTinyNote || "một ngày đặc biệt · những kỷ niệm thật đẹp";
  $("editBrandText").value = currentConfig.brandText || "OUR LITTLE MOMENT";
  $("editMainEyebrow").value = currentConfig.mainEyebrow || "";
  $("editGalleryEyebrow").value = currentConfig.galleryEyebrow || "MEMORIES IN FRAMES";
  $("editGalleryTitle").value = currentConfig.galleryTitle || "Một chút|thanh xuân";
  $("editGalleryCopy").value = currentConfig.galleryCopy || "Những khoảnh khắc mong được cùng bạn viết tiếp.";
  $("editConfirmTitle").value = currentConfig.confirmTitle || "Bạn xác nhận tham gia nhé?";
  $("editConfirmYes").value = currentConfig.confirmYesText || "Đồng ý, mình sẽ tham gia ♥";
  $("editConfirmNo").value = currentConfig.confirmNoText || "Để mình suy nghĩ thêm";
  $("editConfirmCopy").value = currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời. Xác nhận để mở email thông báo cho chủ nhân lời mời.";
  $("editConfirmNote").value = currentConfig.confirmNote || "Email sẽ được soạn sẵn; bạn chỉ cần nhấn Gửi trong ứng dụng email.";
  $("editGreetingPrefix").value = currentConfig.greetingPrefix || "Kính chào:";
  $("editFooterNote").value = currentConfig.footerNote || "";
  $("editRsvpEmail").value = currentConfig.rsvpEmail || "";
  $("editEmailjsPublicKey").value = currentConfig.emailjsPublicKey || "";
  $("editEmailjsServiceId").value = currentConfig.emailjsServiceId || "";
  $("editEmailjsTemplateId").value = currentConfig.emailjsTemplateId || "";
  [1,2,3].forEach(i => { $( `editCaption${i}` ).value = currentConfig.gallery?.[i-1]?.caption || ""; });
  $("editInvitationLine").value = currentConfig.invitationLine || "";
  $("editMainTitle").value = currentConfig.mainTitle || "";
  $("editMessage").value = currentConfig.mainMessage || "";
  $("editDate").value = currentConfig.eventDate || "";
  $("editPlace").value = currentConfig.eventPlace || "";
  $("editButtonText").value = currentConfig.buttonText || "Chấp nhận lời mời";
  $("editFont").value = currentConfig.fontFamily || "DM Sans";
  $("editLobbyOpacity").value = Math.max(0, Math.min(100, Number(currentConfig.lobbyBackgroundOpacity ?? 35)));
  $("lobbyOpacityValue").value = `${$("editLobbyOpacity").value}%`;
  $("clearLobbyBackground").checked = false;
}
async function readImage(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn một tệp ảnh.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Ảnh gốc tối đa 15 MB. Hãy chọn ảnh nhỏ hơn.");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không đọc được ảnh."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Ảnh không hợp lệ hoặc không thể mở."));
    img.src = dataUrl;
  });
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = 0.82;
  let blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", quality));
  while (blob && blob.size > 450 * 1024 && quality > 0.42) {
    quality -= 0.08;
    blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", quality));
  }
  if (!blob) throw new Error("Trình duyệt không hỗ trợ nén ảnh này. Hãy thử ảnh khác.");
  if (blob.size > 500 * 1024) throw new Error("Ảnh vẫn quá lớn sau khi nén. Hãy chọn ảnh khác có dung lượng thấp hơn.");
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không thể hoàn tất việc nén ảnh."));
    reader.readAsDataURL(blob);
  });
}
function downloadConfig() {
  const source = "/* File được xuất từ trình chỉnh sửa thiệp kỷ yếu */\nconst CONFIG = " + JSON.stringify(currentConfig, null, 2) + ";\n";
  const blob = new Blob([source], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "config.js"; a.click();
  URL.revokeObjectURL(url);
}
applyConfig();
loadSavedConfig().then(async () => { applyConfig(); const remembered = await getRememberedName(); if (remembered) $("guestName").value = remembered; });

$("nameForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = $("guestName").value.trim();
  if (!name) return;
  if ($("rememberName").checked) await setRememberedName(name);
  else await setRememberedName("");
  $("gate").classList.add("hidden");
  $("invitation").classList.remove("hidden");
  currentGuestName = name;
  $("helloLine").textContent = `${currentConfig.greetingPrefix || "Kính chào:"} ${name}`;
  const isAdmin = name.toLocaleLowerCase("vi-VN") === ADMIN_NAME;
  $("adminPanel").classList.toggle("hidden", !isAdmin);
  if (isAdmin) fillEditor();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("backBtn").addEventListener("click", () => {
  $("invitation").classList.add("hidden"); $("gate").classList.remove("hidden");
  $("adminPanel").classList.add("hidden"); $("guestName").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
});
$("logoutBtn").addEventListener("click", () => {
  currentGuestName = "";
  $("invitation").classList.add("hidden");
  $("adminPanel").classList.add("hidden");
  $("confirmModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  $("gate").classList.remove("hidden");
  $("guestName").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("closeAdmin").addEventListener("click", () => $("adminPanel").classList.add("hidden"));
$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const cover = await readImage($("editCover").files[0]);
    const background = await readImage($("editBackground").files[0]);
    const lobbyBackground = await readImage($("editLobbyBackground").files[0]);
    const galleryUploads = await Promise.all([1, 2, 3].map(i => readImage($(`editGallery${i}`).files[0])));
    currentConfig = { ...currentConfig,
      siteTitle: $("editSiteTitle").value.trim(), gateButtonText: $("editGateButton").value.trim(),
      gateTinyNote: $("editGateTinyNote").value.trim(), brandText: $("editBrandText").value.trim(),
      galleryEyebrow: $("editGalleryEyebrow").value.trim(), galleryTitle: $("editGalleryTitle").value.trim(),
      galleryCopy: $("editGalleryCopy").value.trim(), confirmTitle: $("editConfirmTitle").value.trim(),
      confirmYesText: $("editConfirmYes").value.trim(), confirmNoText: $("editConfirmNo").value.trim(),
      confirmCopy: $("editConfirmCopy").value.trim(), confirmNote: $("editConfirmNote").value.trim(), gateEyebrow: $("editGateEyebrow").value.trim(),
      gateTitle: $("editGateTitle").value.trim(), gateCopy: $("editGateCopy").value.trim(),
      mainEyebrow: $("editMainEyebrow").value.trim(), greetingPrefix: $("editGreetingPrefix").value.trim(),
      footerNote: $("editFooterNote").value.trim(), rsvpEmail: $("editRsvpEmail").value.trim(),
      emailjsPublicKey: $("editEmailjsPublicKey").value.trim(),
      emailjsServiceId: $("editEmailjsServiceId").value.trim(),
      emailjsTemplateId: $("editEmailjsTemplateId").value.trim(),
      invitationLine: $("editInvitationLine").value.trim(), mainTitle: $("editMainTitle").value.trim(),
      mainMessage: $("editMessage").value.trim(), eventDate: $("editDate").value.trim(),
      eventPlace: $("editPlace").value.trim(), buttonText: $("editButtonText").value.trim(),
      fontFamily: $("editFont").value,
      ...(cover ? { coverImage: cover } : {}), ...(background ? { backgroundImage: background } : {}),
      ...(lobbyBackground ? { lobbyBackgroundImage: lobbyBackground } : {}),
      ...( $("clearLobbyBackground").checked ? { lobbyBackgroundImage: "" } : {}),
      lobbyBackgroundOpacity: Number($("editLobbyOpacity").value),
      gallery: (currentConfig.gallery || []).map((item, index) => ({
        ...item, caption: $(`editCaption${index + 1}`).value.trim(),
        ...(galleryUploads[index] ? { image: galleryUploads[index] } : {})
      }))
    };
    await saveConfigToDB(currentConfig);
    applyConfig();
    ["editCover", "editBackground", "editLobbyBackground", "editGallery1", "editGallery2", "editGallery3"].forEach(id => { $(id).value = ""; });
    if (lobbyPreviewObjectUrl) { URL.revokeObjectURL(lobbyPreviewObjectUrl); lobbyPreviewObjectUrl = ""; }
    alert("Đã lưu thay đổi trên trình duyệt này!");
  } catch (error) {
    console.error(error);
    alert(error.name === "QuotaExceededError"
      ? "Bộ nhớ trình duyệt đã đầy. Hãy giảm dung lượng ảnh hoặc xóa dữ liệu website cũ trong trình duyệt."
      : (error.message || "Có lỗi khi lưu ảnh."));
  }
});
$("exportConfig").addEventListener("click", downloadConfig);

// Cập nhật con số và xem trước độ trong suốt ngay khi admin kéo thanh trượt.
function updateLobbyBackgroundPreview() {
  const value = Math.max(0, Math.min(100, Number($("editLobbyOpacity").value)));
  $("lobbyOpacityValue").value = `${value}%`;
  document.documentElement.style.setProperty("--lobby-bg-opacity", String(value / 100));
  if ($("clearLobbyBackground").checked) {
    document.documentElement.style.setProperty("--lobby-bg-image", "none");
  } else if (lobbyPreviewObjectUrl) {
    document.documentElement.style.setProperty("--lobby-bg-image", `url("${lobbyPreviewObjectUrl}")`);
  } else {
    document.documentElement.style.setProperty("--lobby-bg-image", currentConfig.lobbyBackgroundImage ? `url("${currentConfig.lobbyBackgroundImage}")` : "none");
  }
}
$("editLobbyOpacity").addEventListener("input", updateLobbyBackgroundPreview);
$("editLobbyBackground").addEventListener("change", event => {
  if (lobbyPreviewObjectUrl) URL.revokeObjectURL(lobbyPreviewObjectUrl);
  lobbyPreviewObjectUrl = event.target.files[0] ? URL.createObjectURL(event.target.files[0]) : "";
  $("clearLobbyBackground").checked = false;
  updateLobbyBackgroundPreview();
});
$("clearLobbyBackground").addEventListener("change", updateLobbyBackgroundPreview);


// Hộp xác nhận tham gia và hiệu ứng âm thanh được tạo trực tiếp bằng Web Audio.
function playClickSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(620, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.055);
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.10, audio.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.11);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + 0.12);
    oscillator.onended = () => audio.close();
  } catch (_) { /* Âm thanh có thể bị chặn tùy trình duyệt. */ }
}
document.addEventListener("click", event => {
  const button = event.target.closest("button, .rsvp");
  if (button && !button.disabled) playClickSound();
});

$("rsvpLink").addEventListener("click", () => {
  $("confirmText").textContent = `${currentConfig.confirmCopy || "Cảm ơn bạn đã nhận lời."} ${currentGuestName ? `(${currentGuestName})` : ""} Sau khi xác nhận, email thông báo sẽ được soạn sẵn.`;
  $("confirmModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
});
function closeConfirmModal() {
  $("confirmModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
}
$("confirmNo").addEventListener("click", closeConfirmModal);
$("confirmModal").addEventListener("click", event => {
  if (event.target === $("confirmModal")) closeConfirmModal();
});
$("confirmYes").addEventListener("click", async () => {
  const button = $("confirmYes");
  const recipient = currentConfig.rsvpEmail || "khongtienanhlrtt@gmail.com";
  const publicKey = currentConfig.emailjsPublicKey;
  const serviceId = currentConfig.emailjsServiceId;
  const templateId = currentConfig.emailjsTemplateId;

  if (!window.emailjs || !publicKey || !serviceId || !templateId) {
    alert("Website chưa được cấu hình dịch vụ gửi email. Vui lòng liên hệ chủ nhân lời mời để hoàn tất xác nhận.");
    return;
  }

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "Đang gửi xác nhận...";
  try {
    emailjs.init({ publicKey });
    await emailjs.send(serviceId, templateId, {
      to_email: recipient,
      guest_name: currentGuestName,
      event_date: currentConfig.eventDate || "Chưa cập nhật",
      event_place: currentConfig.eventPlace || "Chưa cập nhật",
      reply_to: "",
      message: `${currentGuestName} đã xác nhận tham gia buổi chụp kỷ yếu.`
    });
    closeConfirmModal();
    alert("Đã gửi xác nhận thành công! Chủ nhân lời mời sẽ nhận được email thông báo.");
  } catch (error) {
    console.error("Lỗi gửi email xác nhận:", error);
    alert("Chưa gửi được thông báo. Vui lòng thử lại sau hoặc liên hệ chủ nhân lời mời.");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
});
