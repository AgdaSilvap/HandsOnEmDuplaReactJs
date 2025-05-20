// src/pages/admin/AdminCreatecategoryPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import categoryService from '@services/categoryService';

const AdminCreatecategoryPage = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const queryClient = useQueryClient();
	const categoryToEdit = state?.category;
	const [category, setcategory] = useState({
		name: ''
	});

	const [errors, setErrors] = useState({});

	// Se for um Categoria para editar, inicializa o estado com os dados do Categoria
	useEffect(() => {
		if (categoryToEdit) {
			setcategory({
				name: categoryToEdit.name
			});
		}
	}, [categoryToEdit]);

	const createCategoryMutation = useMutation({
		mutationFn: categoryService.createcategory,
		onSuccess: () => {
			toast.success('Categoria criado com sucesso!', { icon: '✅' });
			navigate('/admin/categorys');
		},
		onError: (error) => {
			toast.error(`Erro ao criar Categoria: ${error.message}`, { icon: '❌' });
		}
	});

	const updatecategoryMutation = useMutation({
		mutationFn: ({ id, ...fields }) => categoryService.updatecategory(id, fields),
		onSuccess: () => {
			queryClient.invalidateQueries(['categorys']).then(() => {
				toast.success('Categoria atualizado com sucesso!', { icon: '✅' });
				navigate('/admin/categorys');
			}).catch((error) => {
				toast.error(`Erro ao atualizar lista de Categorias: ${error.message}`, { icon: '❌' });
			});
		},
		onError: (error) => {
			toast.error(`Erro ao atualizar Categoria: ${error.message}`, { icon: '❌' });
		}
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setcategory((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!category.name.trim()) {
			newErrors.name = 'O nome da categoria é obrigatório';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = { ...category };

			if (categoryToEdit) {
				await updatecategoryMutation.mutateAsync({ id: categoryToEdit.id, ...payload });
			} else {
				await createCategoryMutation.mutateAsync(payload);
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
						<h2 className="mb-0">{categoryToEdit ? 'Alterar Categoria' : 'Nova Categoria'}</h2>
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
									value={category.title}
									onChange={handleChange} autoFocus />
								{errors.title && <div className="invalid-feedback">{errors.title}</div>}
							</div>
							

							<div className="d-flex">
								<button
									type="submit"
									className="btn btn-success me-2"
									disabled={createCategoryMutation.isPending || updatecategoryMutation.isPending}>
									{createCategoryMutation.isPending || updatecategoryMutation.isPending ? (
										<>
											<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
											Salvando...
										</>
									) : 'Salvar Categoria'}
								</button>
								<button
									type="button"
									className="btn btn-secondary"
									onClick={() => navigate('/admin/categorys')}>
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

export default AdminCreatecategoryPage;