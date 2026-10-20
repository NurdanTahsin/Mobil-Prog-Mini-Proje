import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const CATEGORIES = ['Yazılım', 'Donanım', 'Ağ'];
const STATUS_OPTIONS = ['Bekliyor', 'İşlemde', 'Tamamlandı'];
const FILTER_OPTIONS = ['Tümü', ...STATUS_OPTIONS];

export default function App() {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'Tümü') {
      return requests;
    }

    return requests.filter((request) => request.status === activeFilter);
  }, [activeFilter, requests]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      Alert.alert('Hata', 'Başlık ve açıklama boş bırakılamaz.');
      return;
    }

    const newRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: cleanTitle,
      description: cleanDescription,
      category,
      status: 'Bekliyor',
    };

    setRequests((prevRequests) => [newRequest, ...prevRequests]);
    resetForm();
    Alert.alert('Başarılı', 'Başarıyla eklendi');
  };

  const handleDelete = (id) => {
    Alert.alert('Talebi Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          setRequests((prevRequests) =>
            prevRequests.filter((request) => request.id !== id)
          );
          setExpandedRequestId((prevExpandedId) =>
            prevExpandedId === id ? null : prevExpandedId
          );
          Alert.alert('Bilgi', 'Talep silindi');
        },
      },
    ]);
  };

  const handleToggleDetail = (id) => {
    setExpandedRequestId((prevExpandedId) =>
      prevExpandedId === id ? null : id
    );
  };

  const handleStatusUpdate = (id, nextStatus) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: nextStatus } : request
      )
    );
    Alert.alert('Başarılı', 'Durum güncellendi');
  };

  const renderChipButton = (label, selected, onPress) => (
    <Pressable
      key={label}
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderItem = ({ item }) => {
    const expanded = expandedRequestId === item.id;

    return (
      <Pressable
        onPress={() => handleToggleDetail(item.id)}
        onLongPress={() => handleDelete(item.id)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>

        {expanded && (
          <View style={styles.cardDetail}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Başlık:</Text> {item.title}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Açıklama:</Text>{' '}
              {item.description}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Kategori:</Text> {item.category}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Durum:</Text> {item.status}
            </Text>

            <View style={styles.statusButtons}>
              {STATUS_OPTIONS.map((status) =>
                renderChipButton(
                  status,
                  item.status === status,
                  () => handleStatusUpdate(item.id, status)
                )
              )}
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Teknik Destek Formu</Text>

        <View style={styles.formSection}>
          <TextInput
            placeholder="Başlık"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Açıklama"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.sectionLabel}>Kategori Seç</Text>
          <View style={styles.rowWrap}>
            {CATEGORIES.map((option) =>
              renderChipButton(option, category === option, () => setCategory(option))
            )}
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </Pressable>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionLabel}>Duruma Göre Filtrele</Text>
          <View style={styles.rowWrap}>
            {FILTER_OPTIONS.map((filter) =>
              renderChipButton(
                filter,
                activeFilter === filter,
                () => setActiveFilter(filter)
              )
            )}
          </View>
        </View>

        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Kayıt bulunamadı</Text>
          }
          contentContainerStyle={
            filteredRequests.length === 0 ? styles.emptyContainer : styles.listContainer
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5e9e4',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#4a1f1a',
  },
  formSection: {
    backgroundColor: '#fffaf7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6b8ad',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fffdfb',
  },
  descriptionInput: {
    minHeight: 80,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#4a1f1a',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#b98273',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fffaf7',
  },
  chipSelected: {
    backgroundColor: '#9f2f2f',
    borderColor: '#9f2f2f',
  },
  chipText: {
    color: '#6b2a20',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  filterSection: {
    backgroundColor: '#fffaf7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fffaf7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d6b8ad',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a1f1a',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: '#ead5cd',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeText: {
    color: '#6b2a20',
    fontWeight: '600',
    fontSize: 12,
  },
  cardDetail: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#d6b8ad',
    paddingTop: 10,
    gap: 6,
  },
  detailText: {
    color: '#4a2a24',
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#4a1f1a',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  emptyText: {
    color: '#8a5145',
    fontSize: 16,
    fontWeight: '500',
  },
});
