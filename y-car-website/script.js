// Y-car 新能源汽车网站 - 主脚本文件

/**
 * 图片加载服务类
 * 处理图片加载、错误处理和懒加载
 */
class ImageService {
    constructor() {
        // 配置图片服务 URL
        this.imageServiceUrl = 'https://source.unsplash.com';
        this.placeholderUrl = 'concept-car-placeholder.svg';
        
        // 图片加载状态跟踪
        this.loadedImages = new Set();
        this.failedImages = new Set();
    }
    
    /**
     * 获取概念车图片 URL
     * @param {string} query - 搜索关键词
     * @param {number} width - 图片宽度
     * @param {number} height - 图片高度
     * @returns {string} 图片 URL
     */
    fetchConceptCarImage(query, width = 800, height = 600) {
        return `${this.imageServiceUrl}/${width}x${height}/?${query}`;
    }
    
    /**
     * 处理图片加载失败
     * @param {HTMLImageElement} imageElement - 图片元素
     */
    handleImageError(imageElement) {
        if (!imageElement) return;
        
        const originalSrc = imageElement.src;
        
        // 避免重复处理
        if (this.failedImages.has(originalSrc)) {
            return;
        }
        
        this.failedImages.add(originalSrc);
        
        // 替换为占位符图片
        imageElement.src = this.placeholderUrl;
        imageElement.alt = '概念车图片加载失败';
        
        // 添加错误样式类
        imageElement.classList.add('image-error');
        
        // 记录错误日志
        console.warn(`图片加载失败: ${originalSrc}`);
    }
    
    /**
     * 为图片元素设置加载和错误处理
     * @param {HTMLImageElement} imageElement - 图片元素
     * @param {string} imageUrl - 图片 URL
     */
    setupImageHandlers(imageElement, imageUrl) {
        if (!imageElement) return;
        
        // 设置图片源
        imageElement.src = imageUrl;
        
        // 添加加载成功处理
        imageElement.addEventListener('load', () => {
            this.loadedImages.add(imageUrl);
            imageElement.classList.add('image-loaded');
        }, { once: true });
        
        // 添加加载失败处理
        imageElement.addEventListener('error', () => {
            this.handleImageError(imageElement);
        }, { once: true });
    }
    
    /**
     * 预加载图片数组
     * @param {string[]} urls - 图片 URL 数组
     * @returns {Promise<void>}
     */
    async preloadImages(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.loadedImages.add(url);
                    resolve();
                };
                img.onerror = () => {
                    this.failedImages.add(url);
                    reject(new Error(`Failed to load: ${url}`));
                };
                img.src = url;
            });
        });
        
        try {
            await Promise.allSettled(promises);
        } catch (error) {
            console.warn('部分图片预加载失败', error);
        }
    }
    
    /**
     * 实现图片懒加载（可选功能）
     * @param {HTMLImageElement} imageElement - 图片元素
     * @param {string} imageUrl - 图片 URL
     */
    setupLazyLoading(imageElement, imageUrl) {
        if (!imageElement) return;
        
        // 检查浏览器是否支持 IntersectionObserver
        if ('IntersectionObserver' in window) {
            // 先设置占位符
            imageElement.dataset.src = imageUrl;
            imageElement.src = this.placeholderUrl;
            
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const realSrc = img.dataset.src;
                        
                        if (realSrc) {
                            this.setupImageHandlers(img, realSrc);
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            observer.observe(imageElement);
        } else {
            // 不支持懒加载，直接加载图片
            this.setupImageHandlers(imageElement, imageUrl);
        }
    }
}

// 创建全局图片服务实例
const imageService = new ImageService();

/**
 * 表单验证服务类
 * 处理联系表单的各项验证规则
 */
class FormValidator {
    /**
     * 验证姓名
     * @param {string} name - 姓名
     * @returns {boolean} 是否有效
     */
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        
        // 去除首尾空格后检查
        const trimmedName = name.trim();
        
        // 检查是否为空或纯空格
        if (trimmedName.length === 0) {
            return false;
        }
        
        // 检查长度是否在 2-50 字符之间
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 验证电话号码
     * @param {string} phone - 电话号码
     * @returns {boolean} 是否有效
     */
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }
        
        // 中国手机号格式：1[3-9]\d{9}
        const phoneRegex = /^1[3-9]\d{9}$/;
        
        // 去除空格后验证
        const cleanPhone = phone.trim();
        
        return phoneRegex.test(cleanPhone);
    }
    
    /**
     * 验证邮箱地址
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        // 标准邮箱格式（RFC 5322 简化版）
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        // 去除空格后验证
        const cleanEmail = email.trim();
        
        return emailRegex.test(cleanEmail);
    }
    
    /**
     * 验证整个表单
     * @param {Object} formData - 表单数据对象
     * @param {string} formData.name - 姓名
     * @param {string} formData.phone - 电话
     * @param {string} formData.email - 邮箱
     * @returns {Object} 验证结果 { isValid: boolean, errors: Object }
     */
    validateForm(formData) {
        const errors = {};
        let isValid = true;
        
        // 验证姓名
        if (!this.validateName(formData.name)) {
            errors.name = '请输入有效的姓名（2-50个字符）';
            isValid = false;
        }
        
        // 验证电话
        if (!this.validatePhone(formData.phone)) {
            errors.phone = '请输入有效的11位手机号码';
            isValid = false;
        }
        
        // 验证邮箱
        if (!this.validateEmail(formData.email)) {
            errors.email = '请输入有效的邮箱地址';
            isValid = false;
        }
        
        return {
            isValid,
            errors
        };
    }
}

// 创建全局表单验证器实例
const formValidator = new FormValidator();

/**
 * 本地存储服务类
 * 处理购车意向数据的存储和读取
 */
class StorageService {
    constructor() {
        this.storageKey = 'y-car-purchase-intents';
    }
    
    /**
     * 保存购车意向数据
     * @param {Object} data - 购车意向数据
     * @param {string} data.name - 姓名
     * @param {string} data.phone - 电话
     * @param {string} data.email - 邮箱
     * @param {string} data.interestedModel - 意向车型
     * @param {string} data.message - 留言（可选）
     * @param {number} data.timestamp - 时间戳
     */
    savePurchaseIntent(data) {
        try {
            // 获取现有数据
            const existingData = this.getAllPurchaseIntents();
            
            // 添加新数据
            existingData.push(data);
            
            // 保存到 LocalStorage
            localStorage.setItem(this.storageKey, JSON.stringify(existingData));
            
            console.log('购车意向已保存', data);
            return true;
        } catch (error) {
            console.error('保存购车意向失败', error);
            return false;
        }
    }
    
    /**
     * 获取所有购车意向数据
     * @returns {Array} 购车意向数据数组
     */
    getAllPurchaseIntents() {
        try {
            const data = localStorage.getItem(this.storageKey);
            
            if (!data) {
                return [];
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.error('读取购车意向失败', error);
            return [];
        }
    }
    
    /**
     * 清空所有存储数据
     */
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('存储数据已清空');
            return true;
        } catch (error) {
            console.error('清空存储失败', error);
            return false;
        }
    }
}

// 创建全局存储服务实例
const storageService = new StorageService();

// 车型数据模型
const vehicleModels = [
    {
        id: 'y-car-sport',
        name: 'Y-Car Sport',
        imageUrl: 'https://source.unsplash.com/800x600/?electric-car,sport',
        range: 650,
        priceRange: { min: 299000, max: 399000 },
        features: ['0-100km/h 3.2秒', '智能驾驶辅助', '全景天幕']
    },
    {
        id: 'y-car-comfort',
        name: 'Y-Car Comfort',
        imageUrl: 'https://source.unsplash.com/800x600/?electric-car,luxury',
        range: 720,
        priceRange: { min: 259000, max: 329000 },
        features: ['超长续航', '豪华内饰', '静音座舱']
    },
    {
        id: 'y-car-urban',
        name: 'Y-Car Urban',
        imageUrl: 'https://source.unsplash.com/800x600/?electric-car,compact',
        range: 520,
        priceRange: { min: 189000, max: 239000 },
        features: ['城市代步', '灵活停车', '经济实惠']
    }
];

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('Y-car 网站已加载');
    
    // 初始化功能
    renderVehicleGallery();
    initSmoothScroll();
    initConsultButton();
    initImageModal();
    initContactForm();
    populateVehicleOptions();
    initScrollAnimations();
    initMobileMenu();
});

/**
 * 渲染单个车型卡片
 * @param {Object} vehicle - 车型数据对象
 * @returns {HTMLElement} 车型卡片DOM元素
 */
function renderVehicleCard(vehicle) {
    // 创建卡片容器
    const card = document.createElement('article');
    card.className = 'vehicle-card';
    card.setAttribute('data-vehicle-id', vehicle.id);
    card.setAttribute('role', 'listitem');
    
    // 创建图片容器
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'vehicle-image-wrapper';
    
    const image = document.createElement('img');
    image.className = 'vehicle-image';
    image.alt = `${vehicle.name} 概念车 - 续航${vehicle.range}公里，价格${(vehicle.priceRange.min / 10000).toFixed(1)}-${(vehicle.priceRange.max / 10000).toFixed(1)}万元`;
    image.loading = 'lazy';
    image.width = 800;
    image.height = 600;
    
    // 使用 ImageService 处理图片加载
    imageService.setupImageHandlers(image, vehicle.imageUrl);
    
    // 添加图片点击放大功能
    image.addEventListener('click', () => {
        openImageModal(vehicle.imageUrl, `${vehicle.name} 概念车`);
    });
    
    // 添加键盘支持
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `点击查看${vehicle.name}大图`);
    image.style.cursor = 'pointer';
    
    image.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openImageModal(vehicle.imageUrl, `${vehicle.name} 概念车`);
        }
    });
    
    imageWrapper.appendChild(image);
    
    // 创建信息容器
    const info = document.createElement('div');
    info.className = 'vehicle-info';
    
    // 车型名称
    const name = document.createElement('h3');
    name.className = 'vehicle-name';
    name.textContent = vehicle.name;
    
    // 续航里程
    const range = document.createElement('p');
    range.className = 'vehicle-range';
    range.innerHTML = `<strong>续航里程：</strong>${vehicle.range} 公里`;
    
    // 价格区间
    const price = document.createElement('p');
    price.className = 'vehicle-price';
    const priceMin = (vehicle.priceRange.min / 10000).toFixed(1);
    const priceMax = (vehicle.priceRange.max / 10000).toFixed(1);
    price.innerHTML = `<strong>价格区间：</strong>${priceMin} - ${priceMax} 万元`;
    
    // 特点列表
    const featuresTitle = document.createElement('p');
    featuresTitle.className = 'vehicle-features-title';
    featuresTitle.innerHTML = '<strong>核心特点：</strong>';
    
    const featuresList = document.createElement('ul');
    featuresList.className = 'vehicle-features';
    featuresList.setAttribute('aria-label', `${vehicle.name}核心特点`);
    
    vehicle.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // 了解更多按钮
    const button = document.createElement('button');
    button.className = 'vehicle-button';
    button.textContent = '了解更多';
    button.setAttribute('aria-label', `了解${vehicle.name}更多信息`);
    button.addEventListener('click', () => {
        console.log(`查看车型详情: ${vehicle.name}`);
    });
    
    // 组装卡片
    info.appendChild(name);
    info.appendChild(range);
    info.appendChild(price);
    info.appendChild(featuresTitle);
    info.appendChild(featuresList);
    info.appendChild(button);
    
    card.appendChild(imageWrapper);
    card.appendChild(info);
    
    return card;
}

/**
 * 渲染所有车型到展示区
 */
function renderVehicleGallery() {
    const gallery = document.getElementById('vehicleGallery');
    
    if (!gallery) {
        console.error('未找到车型展示容器');
        return;
    }
    
    // 清空现有内容
    gallery.innerHTML = '';
    
    // 渲染每个车型
    vehicleModels.forEach(vehicle => {
        const card = renderVehicleCard(vehicle);
        gallery.appendChild(card);
    });
    
    console.log(`已渲染 ${vehicleModels.length} 个车型`);
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 初始化"立即咨询"按钮
 */
function initConsultButton() {
    const consultBtn = document.getElementById('consultBtn');
    const contactFormWrapper = document.getElementById('contactFormWrapper');
    
    if (consultBtn && contactFormWrapper) {
        consultBtn.addEventListener('click', function() {
            // 显示表单
            contactFormWrapper.style.display = 'block';
            
            // 滚动到联系表单区域
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerOffset = 80;
                const elementPosition = contactSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/**
 * 打开图片放大模态框
 * @param {string} imageUrl - 图片 URL
 * @param {string} altText - 图片描述
 */
function openImageModal(imageUrl, altText) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalClose = document.getElementById('modalClose');
    
    if (modal && modalImage) {
        modalImage.src = imageUrl;
        modalImage.alt = altText;
        modal.style.display = 'flex';
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 聚焦到关闭按钮以支持键盘导航
        if (modalClose) {
            setTimeout(() => modalClose.focus(), 100);
        }
    }
}

/**
 * 关闭图片放大模态框
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    
    if (modal) {
        modal.style.display = 'none';
        
        // 恢复背景滚动
        document.body.style.overflow = 'auto';
    }
}

/**
 * 初始化图片模态框事件
 */
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const modalClose = document.getElementById('modalClose');
    
    // 点击关闭按钮
    if (modalClose) {
        modalClose.addEventListener('click', closeImageModal);
        
        // 添加键盘支持
        modalClose.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeImageModal();
            }
        });
    }
    
    // 点击模态框背景关闭
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeImageModal();
            }
        });
    }
    
    // ESC 键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('imageModal');
            if (modal && modal.style.display === 'flex') {
                closeImageModal();
            }
        }
    });
}

/**
 * 填充车型选项到表单下拉列表
 */
function populateVehicleOptions() {
    const selectElement = document.getElementById('interestedModel');
    
    if (!selectElement) {
        console.error('未找到车型选择下拉列表');
        return;
    }
    
    // 为每个车型添加选项
    vehicleModels.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = vehicle.name;
        selectElement.appendChild(option);
    });
}

/**
 * 初始化联系表单功能
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    
    if (!form) {
        console.error('未找到联系表单');
        return;
    }
    
    // 为每个输入字段添加实时验证
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateField('name', this.value);
        });
        
        nameInput.addEventListener('blur', function() {
            validateField('name', this.value);
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            validateField('phone', this.value);
        });
        
        phoneInput.addEventListener('blur', function() {
            validateField('phone', this.value);
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateField('email', this.value);
        });
        
        emailInput.addEventListener('blur', function() {
            validateField('email', this.value);
        });
    }
    
    // 表单提交事件处理
    form.addEventListener('submit', handleFormSubmit);
}

/**
 * 验证单个表单字段并显示错误消息
 * @param {string} fieldName - 字段名称 ('name', 'phone', 'email')
 * @param {string} value - 字段值
 * @returns {boolean} 是否有效
 */
function validateField(fieldName, value) {
    let isValid = false;
    let errorMessage = '';
    
    // 根据字段类型进行验证
    switch (fieldName) {
        case 'name':
            isValid = formValidator.validateName(value);
            if (!isValid && value.trim().length > 0) {
                errorMessage = '请输入有效的姓名（2-50个字符）';
            } else if (!isValid && value.trim().length === 0) {
                errorMessage = '姓名不能为空';
            }
            break;
            
        case 'phone':
            isValid = formValidator.validatePhone(value);
            if (!isValid && value.trim().length > 0) {
                errorMessage = '请输入有效的11位手机号码';
            } else if (!isValid && value.trim().length === 0) {
                errorMessage = '手机号码不能为空';
            }
            break;
            
        case 'email':
            isValid = formValidator.validateEmail(value);
            if (!isValid && value.trim().length > 0) {
                errorMessage = '请输入有效的邮箱地址';
            } else if (!isValid && value.trim().length === 0) {
                errorMessage = '邮箱地址不能为空';
            }
            break;
    }
    
    // 显示或隐藏错误消息
    displayFieldError(fieldName, errorMessage);
    
    // 更新输入框样式
    updateFieldStyle(fieldName, isValid, value);
    
    return isValid;
}

/**
 * 显示字段错误消息
 * @param {string} fieldName - 字段名称
 * @param {string} errorMessage - 错误消息
 */
function displayFieldError(fieldName, errorMessage) {
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
        
        // 如果有错误消息，添加可见性
        if (errorMessage) {
            errorElement.style.display = 'block';
        } else {
            errorElement.style.display = 'block'; // 保持占位空间
        }
    }
}

/**
 * 更新字段样式（有效/无效）
 * @param {string} fieldName - 字段名称
 * @param {boolean} isValid - 是否有效
 * @param {string} value - 当前值
 */
function updateFieldStyle(fieldName, isValid, value) {
    const inputElement = document.getElementById(fieldName);
    
    if (!inputElement) return;
    
    // 只有在用户输入了内容后才显示样式
    if (value.trim().length > 0) {
        if (isValid) {
            inputElement.style.borderColor = '#10b981'; // 绿色表示有效
            inputElement.setAttribute('aria-invalid', 'false');
        } else {
            inputElement.style.borderColor = '#ef4444'; // 红色表示无效
            inputElement.setAttribute('aria-invalid', 'true');
        }
    } else {
        // 清空时恢复默认样式
        inputElement.style.borderColor = '';
        inputElement.setAttribute('aria-invalid', 'false');
    }
}

/**
 * 处理表单提交
 * @param {Event} e - 提交事件
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        interestedModel: document.getElementById('interestedModel').value,
        message: document.getElementById('message').value,
        timestamp: Date.now()
    };
    
    // 验证表单
    const validationResult = formValidator.validateForm(formData);
    
    if (!validationResult.isValid) {
        // 显示所有错误消息
        Object.keys(validationResult.errors).forEach(fieldName => {
            displayFieldError(fieldName, validationResult.errors[fieldName]);
            updateFieldStyle(fieldName, false, formData[fieldName]);
        });
        
        console.log('表单验证失败', validationResult.errors);
        return;
    }
    
    // 保存数据到 LocalStorage
    const saved = storageService.savePurchaseIntent(formData);
    
    if (saved) {
        // 显示成功消息
        showSuccessMessage();
        
        // 清空表单
        clearForm();
        
        console.log('表单提交成功', formData);
    } else {
        // 显示错误消息
        alert('提交失败，请稍后重试');
    }
}

/**
 * 显示成功消息
 */
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    
    if (successMessage) {
        successMessage.style.display = 'block';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
}

/**
 * 清空表单字段
 */
function clearForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        // 重置表单
        form.reset();
        
        // 清除所有错误消息
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
        
        // 重置所有输入框样式
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
    }
}

/**
 * 初始化滚动动画
 * 为页面元素添加淡入效果
 */
function initScrollAnimations() {
    // 检查浏览器是否支持 IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
        console.warn('IntersectionObserver 不可用，跳过滚动动画');
        return;
    }
    
    // 选择需要添加动画的元素
    const animatedElements = document.querySelectorAll(
        '.vehicle-card, .feature-item, .section-title, .section-subtitle, .contact-form-wrapper'
    );
    
    // 为每个元素添加 fade-in 类
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // 创建 Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 元素进入视口时添加 visible 类
                entry.target.classList.add('visible');
                
                // 可选：观察一次后停止观察
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有动画元素
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    console.log(`已为 ${animatedElements.length} 个元素添加滚动动画`);
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    if (!mobileMenuToggle || !mainNav) {
        console.warn('移动端菜单元素未找到');
        return;
    }
    
    // 切换菜单显示/隐藏
    mobileMenuToggle.addEventListener('click', function() {
        const isExpanded = this.classList.toggle('active');
        mainNav.classList.toggle('active');
        
        // 更新 ARIA 属性
        this.setAttribute('aria-expanded', isExpanded);
        
        // 防止背景滚动
        if (mainNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            // 聚焦到第一个导航链接
            const firstLink = mainNav.querySelector('.nav-links a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        } else {
            document.body.style.overflow = 'auto';
        }
    });
    
    // 点击导航链接后关闭菜单
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        });
    });
    
    // 点击菜单外部区域关闭菜单
    document.addEventListener('click', function(e) {
        if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            if (mainNav.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // ESC 键关闭菜单
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
            mobileMenuToggle.focus();
        }
    });
    
    // 窗口大小改变时，如果切换到桌面视图，关闭移动菜单
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
        }
    });
    
    console.log('移动端菜单已初始化');
}

/**
 * 滚动时的导航栏效果
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }
});
