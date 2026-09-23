package com.example.data.model

data class VoucherPackage(
    val id: String,
    val name: String,
    val duration: String,
    val price: String,
    val speedLimit: String = ""
)

data class VisualSettings(
    val hotspotName: String = "VoltNet Hotspot",
    val welcomeTitle: String = "Selamat Datang di Hotspot Kami",
    val welcomeSubtitle: String = "Silakan masukkan kode voucher untuk akses internet cepat",
    val adminWhatsapp: String = "6281234567890",
    val primaryColorHex: String = "#0284c7",
    val voucherPackages: List<VoucherPackage> = listOf(
        VoucherPackage("1", "1 Jam", "60 Menit", "Rp 2.000", "Up to 5 Mbps"),
        VoucherPackage("2", "3 Jam", "180 Menit", "Rp 5.000", "Up to 10 Mbps"),
        VoucherPackage("3", "24 Jam", "1 Hari Penuh", "Rp 10.000", "Up to 15 Mbps"),
        VoucherPackage("4", "7 Hari", "1 Minggu", "Rp 35.000", "Up to 20 Mbps")
    )
)
