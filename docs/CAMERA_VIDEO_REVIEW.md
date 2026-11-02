# Audit kamera — video petal_20261102_214120

Rekaman sekitar 32 detik menunjukkan skala avatar berubah besar berulang kali: sekitar detik 6 tampilan mendekati kepala, kemudian jauh lagi; sekitar detik 15–18 kepala kembali memenuhi layar sebelum kembali jauh. Tanpa data input video tidak membuktikan persis jari mana yang memicu tiap perubahan.

## Penyebab yang dikonfirmasi pada kode

1. CameraCollision.resolve memotong ray target–kamera pada dinding/terrain. Ketika jarak aman sangat kecil, CameraBoom langsung menyamakan distance dengan nilai kecil itu. Ini zoom karena tabrakan, bukan perubahan FOV.
2. Kamera di-lerp dalam koordinat dunia; interpolasi dua titik orbit memotong lingkaran dan dapat memotong sudut dinding.
3. Setelah lerp ada resolve kedua yang memotong kamera lagi seketika, mengalahkan penghalusan posisi.
4. Revisi sebelumnya menghapus pencarian sisi liar, tetapi akibatnya hanya menyisakan pemendekan pada satu ray. Ini belum memenuhi permintaan menggeser kamera lebih dahulu.

## Perubahan pilot

StableCameraOrbit memeriksa sisi pada ketinggian yang dipilih pemain, memulai koreksi sebelum ray benar-benar tertutup, mempertahankan arah hindar minimal 1,2 detik, membatasi koreksi otomatis 0,85 rad/detik dan membatasi pencarian luas setiap 150 ms. Putaran bebas mengikuti input maksimal 3,2 rad/detik. Bila putaran memasuki batas dinding dari sisi yang cukup lapang, langkah sudut dibatasi di tepi aman alih-alih langsung memperpendek radius. Tidak mencari sisi secara teleport dan tidak menaikkan pitch.

Posisi mengikuti target dan offset orbit langsung setelah penghalusan yaw/pitch/tinggi yang existing; lerp chord dan resolve kedua pada kamera normal dihapus. Collision volume dan boom masih dipakai sekali sesudah pemilihan sisi. FOV tetap 60. Cuplikan boss tetap memakai resolver terpisah.

## Batas yang belum selesai

**Jarak belum konstan mutlak pada koridor yang benar-benar sempit.** Jika semua ray tertutup, termasuk ketika karakter bergerak mendekati dinding saat koreksi belum selesai, collision masih memendekkan radius untuk menjaga kamera di luar solid. Paket ini tidak menghapus seluruh kemungkinan mendekati karakter pada ruang tertutup. Menjaga radius penuh sekaligus semua dinding opaque/solid dalam ruang yang lebih kecil dari radius tidak mungkin; perlu pelebaran area atau keputusan fallback occlusion yang disepakati. Pelebaran kapal–dinding dan redesain semua koridor belum dikerjakan di paket ini.

Browser pengujian gagal membuat WebGL context (GL_RENDERER Disabled). Unit test menilai lintasan/sisi/kecepatan dan geometri, bukan kenyamanan visual nyata. Karena itu kamera ini **pilot source**, belum dinyatakan final nyaman. Uji di HP/tablet tetap diperlukan, terutama tikungan sempit, naik kapal/pohon, joystick + drag bersamaan dan rotasi penuh. Jangan menyebut seluruh keluhan kamera selesai hanya karena build lulus.
