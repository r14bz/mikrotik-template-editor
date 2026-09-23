package com.example.ui.screens.editor

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.VisualSettings
import com.example.data.model.VoucherPackage

@Composable
fun VisualCustomizerView(
    initialSettings: VisualSettings,
    onApplySettings: (VisualSettings) -> Unit,
    modifier: Modifier = Modifier
) {
    var settings by remember(initialSettings) { mutableStateOf(initialSettings) }
    var appliedNotification by remember { mutableStateOf(false) }

    val colorPresets = listOf(
        "#0284c7" to "Sky Blue",
        "#10b981" to "Emerald",
        "#8b5cf6" to "Purple Glow",
        "#06b6d4" to "Cyber Cyan",
        "#f59e0b" to "Amber Gold",
        "#ef4444" to "Crimson"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Kustomisasi Cepat (No-Code)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    Text(
                        text = "Ubah identitas portal, warna, paket voucher, dan nomor CS tanpa membuka kode.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Section 1: Identitas Hotspot
        Text(
            text = "1. IDENTITAS PORTAL",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = settings.hotspotName,
            onValueChange = { settings = settings.copy(hotspotName = it) },
            label = { Text("Nama Hotspot / Brand") },
            placeholder = { Text("Contoh: VoltNet Hotspot") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = settings.welcomeSubtitle,
            onValueChange = { settings = settings.copy(welcomeSubtitle = it) },
            label = { Text("Sub-judul / Slogan") },
            placeholder = { Text("Internet Cepat & Murah") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = settings.adminWhatsapp,
            onValueChange = { settings = settings.copy(adminWhatsapp = it) },
            label = { Text("Nomor WhatsApp Admin (Beli Voucher)") },
            placeholder = { Text("6281234567890") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            leadingIcon = {
                Icon(imageVector = Icons.Default.Phone, contentDescription = null)
            }
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Section 2: Pilihan Warna Tema
        Text(
            text = "2. WARNA AKSEN UTAMA",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            colorPresets.forEach { (hex, name) ->
                val color = runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Color.Blue)
                val isSelected = settings.primaryColorHex.equals(hex, ignoreCase = true)
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(color)
                        .clickable { settings = settings.copy(primaryColorHex = hex) }
                        .then(
                            if (isSelected) Modifier.border(3.dp, MaterialTheme.colorScheme.onBackground, CircleShape)
                            else Modifier
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    if (isSelected) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Terpilih",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Section 3: Daftar Paket Voucher
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "3. DAFTAR TARIF PAKET VOUCHER",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.weight(1f))
            Button(
                onClick = {
                    val newPkg = VoucherPackage(
                        id = System.currentTimeMillis().toString(),
                        name = "Paket Baru",
                        duration = "1 Jam",
                        price = "Rp 3.000",
                        speedLimit = "Up to 5 Mbps"
                    )
                    settings = settings.copy(voucherPackages = settings.voucherPackages + newPkg)
                },
                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp),
                modifier = Modifier.height(30.dp)
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Tambah", fontSize = 11.sp)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        settings.voucherPackages.forEachIndexed { index, pkg ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = pkg.name,
                                onValueChange = { newName ->
                                    val updated = settings.voucherPackages.toMutableList()
                                    updated[index] = pkg.copy(name = newName)
                                    settings = settings.copy(voucherPackages = updated)
                                },
                                label = { Text("Nama", fontSize = 10.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = pkg.price,
                                onValueChange = { newPrice ->
                                    val updated = settings.voucherPackages.toMutableList()
                                    updated[index] = pkg.copy(price = newPrice)
                                    settings = settings.copy(voucherPackages = updated)
                                },
                                label = { Text("Harga", fontSize = 10.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = pkg.duration,
                                onValueChange = { newDur ->
                                    val updated = settings.voucherPackages.toMutableList()
                                    updated[index] = pkg.copy(duration = newDur)
                                    settings = settings.copy(voucherPackages = updated)
                                },
                                label = { Text("Durasi", fontSize = 10.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = pkg.speedLimit,
                                onValueChange = { newSpeed ->
                                    val updated = settings.voucherPackages.toMutableList()
                                    updated[index] = pkg.copy(speedLimit = newSpeed)
                                    settings = settings.copy(voucherPackages = updated)
                                },
                                label = { Text("Kecepatan", fontSize = 10.sp) },
                                modifier = Modifier.weight(1f),
                                singleLine = true
                            )
                        }
                    }

                    IconButton(
                        onClick = {
                            val updated = settings.voucherPackages.toMutableList()
                            updated.removeAt(index)
                            settings = settings.copy(voucherPackages = updated)
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Hapus Paket",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                onApplySettings(settings)
                appliedNotification = true
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(imageVector = Icons.Default.Check, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Terapkan ke Template Sekarang", fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
