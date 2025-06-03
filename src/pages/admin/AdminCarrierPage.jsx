import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import carriersService from '@services/carrierService';
import Pagination from '@components/Pagination';

const CARRIERS_PER_PAGE = 8;

const AdminCarriesPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Lista de Transportadoras
    const {
        data,
        isLoading: loadingCarriers,
        isError,
        error,
    } = useQuery({
        queryKey: ['carriers', currentPage],
        queryFn: () => carriersService.getCarriersByPage(currentPage, CARRIERS_PER_PAGE),
        keepPreviousData: true,
    });

    // Manipulador para mudança de página
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Rolar para o topo da página
        window.scrollTo(0, 0);
    };

    // Mutação para excluir Transportadora
    const deleteMutation = useMutation({
        mutationFn: carriersService.deleteCarriers,
        onSuccess: () => {
            toast.success('Transportadora excluída', { icon: '🗑️' });
            queryClient.invalidateQueries(['carriers']);
        },
        onError: (err) => toast.error(`Erro: ${err.message}`, { icon: '❌' }),
    });

    // Função para excluir Transportadora
    const handleDelete = (id) => {
        if (window.confirm('Excluir Transportadora? Esta ação é irreversível.')) {
            deleteMutation.mutate(id);
        }
    };

    // Função para editar Transportadora
    const handleEdit = (carrier) => {
        navigate(`/admin/carriers/edit/${carrier.id}`, { state: { carrier } });
    };

    if (isError) {
        return (
            <div className="alert alert-danger mt-4">
                Erro ao carregar Transportadoras: {error.message}
            </div>
        );
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 mb-3">
                <div className="card">
                    <div className="card-header text-bg-light d-flex justify-content-between align-items-center py-3">
                        <h2 className="mb-0">Transportadoras</h2>
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/admin/carriers/new')}>
                            Adicionar Transportadora
                        </button>
                    </div>
                    <div className="card-body p-0">
                        {loadingCarriers ? (
                            <div className="text-center my-5">
                                <div className="spinner-border" role="status"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped align-middle mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Nome</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.carriers?.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4">
                                                    Nenhuma Transportadora encontrada.
                                                </td>
                                            </tr>
                                        )}
                                        {data?.carriers && data.carriers.map((carrier) => (
                                            <tr key={carrier.id}>
                                                <td>{carrier.name}</td>
                                                <td className="text-center one-line-cell px-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-warning me-2"
                                                        onClick={() => handleEdit(carrier)}>
                                                        Alterar
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(carrier.id)}>
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {data?.totalPages > 1 && (
                <>
                    <div className="d-flex justify-content-center mb-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data?.totalPages}
                            onPageChange={handlePageChange} />
                    </div>
                    <p className="small text-center m-0">
                        Mostrando página {currentPage} de {data?.totalPages}
                    </p>
                </>
            )}
        </div>
    );
};

export default AdminCarriesPage; 