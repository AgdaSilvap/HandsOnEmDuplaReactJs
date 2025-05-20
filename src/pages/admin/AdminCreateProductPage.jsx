// src/pages/admin/AdminCreateProductPage.jsx
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';
import categoryService from '@services/categoryService';

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryClient = useQueryClient();
    const productToEdit = state?.product;
    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        image: ''
    });

    const [errors, setErrors] = useState({});

    // Buscar categorias
    const { data: categories, isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAllCategories(),
        onError: (error) => {
            toast.error(`Erro ao carregar categorias: ${error.message}`, { icon: '❌' });
        }
    });

    // Se for um produto para editar, inicializa o estado com os dados do produto
    useEffect(() => {
        if (productToEdit) {
            setProduct({
                title: productToEdit.title,
                description: productToEdit.description,
                price: productToEdit.price,
                image: productToEdit.image,
                id: productToEdit.id || ''
            });
        }
    }, [productToEdit]);

    const createProductMutation = useMutation({
        mutationFn: productService.createProduct,
        onSuccess: () => {
            toast.success('Produto criado com sucesso!', { icon: '✅' });
            navigate('/admin/products');
        },
        onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, ...fields }) => productService.updateProduct(id, fields),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']).then(() => {
                toast.success('Produto atualizado com sucesso!', { icon: '✅' });
                navigate('/admin/products');
            }).catch((error) => {
                toast.error(`Erro ao atualizar lista de produtos: ${error.message}`, { icon: '❌' });
            });
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!product.title.trim()) {
            newErrors.title = 'O título é obrigatório';
        }
        if (!product.description.trim()) {
            newErrors.description = 'A descrição é obrigatória';
        }
        if (!product.price) {
            newErrors.price = 'O preço é obrigatório';
        } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
            newErrors.price = 'O preço deve ser um número positivo';
        }
        if (!product.image.trim()) {
            newErrors.image = 'A URL da imagem é obrigatória';
        }
        if (!product.id) {
            newErrors.id = 'Selecione uma categoria';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = { ...product, price: parseFloat(product.price) };

            if (productToEdit) {
                await updateProductMutation.mutateAsync({ id: productToEdit.id, ...payload });
            } else {
                const { id, ...productWithoutId } = payload;
                await createProductMutation.mutateAsync(productWithoutId);
            }
        } catch (err) {
            toast.error(`Erro ao salvar: ${err.message}`, { icon: '❌' });
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">{productToEdit ? 'Alterar Produto' : 'Novo Produto'}</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    id="title"
                                    name="title"
                                    value={product.title}
                                    onChange={handleChange} autoFocus />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Descrição</label>
                                <textarea
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={product.description}
                                    onChange={handleChange}></textarea>
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="id" className="form-label">Categoria</label>
                                <select
                                    className={`form-select ${errors.id ? 'is-invalid' : ''}`}
                                    id="id"
                                    name="id"
                                    value={product.id}
                                    onChange={handleChange}
                                    disabled={loadingCategories}>
                                    <option value="">Selecione uma categoria...</option>
                                    {categories?.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.id && <div className="invalid-feedback">{errors.id}</div>}
                                {loadingCategories &&
                                    <div className="form-text">
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Carregando categorias...
                                    </div>
                                }
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">Preço (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                    id="price"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange} />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">URL da Imagem</label>
                                <input
                                    type="url"
                                    className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                                    id="image"
                                    name="image"
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    value={product.image}
                                    onChange={handleChange} />
                                {errors.image && <div className="invalid-feedback">{errors.image}</div>}
                                <div className="form-text">
                                    Insira a URL completa de uma imagem disponível na internet
                                </div>
                            </div>

                            {product.image && (
                                <div className="mb-3 text-start">
                                    <label className="form-label">Pré-visualização</label>
                                    <div>
                                        <img
                                            src={product.image}
                                            alt="Pré-visualização"
                                            className="img-thumbnail"
                                            style={{ maxHeight: 200 }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/400x300?text=Imagem+Inválida';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : 'Salvar Produto'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/admin/products')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateProductPage;